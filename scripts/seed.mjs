#!/usr/bin/env node
// Seeds the two allowed accounts into Supabase auth.users and the 26 A-Z
// chapters into public.alphabet_dates. Both halves are idempotent.
//
//   npm run seed                       create missing users, skip existing
//   npm run seed -- --update-passwords also reset existing users' passwords
//
// Never prints passwords or the service-role key.

import { createClient } from "@supabase/supabase-js";

const LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);
const MIN_PASSWORD_LENGTH = 6; // Supabase's own default minimum
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const flags = new Set(process.argv.slice(2));
const UPDATE_PASSWORDS = flags.has("--update-passwords");

const norm = (v) => (typeof v === "string" ? v.trim() : "");
const lower = (v) => norm(v).toLowerCase();

// ---------------------------------------------------------------- env check

function readEnv() {
  const problems = [];
  const need = (key) => {
    const v = norm(process.env[key]);
    if (!v) problems.push(`${key} is missing or empty`);
    return v;
  };

  const url = need("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = need("SUPABASE_SERVICE_ROLE_KEY");
  const email1 = need("SEED_USER_1_EMAIL");
  const password1 = need("SEED_USER_1_PASSWORD");
  const email2 = need("SEED_USER_2_EMAIL");
  const password2 = need("SEED_USER_2_PASSWORD");

  // Catch the single most likely copy-paste mistake: the publishable key in
  // the service-role slot. That produces an opaque 403 from the Admin API.
  if (serviceKey.startsWith("sb_publishable_")) {
    problems.push(
      "SUPABASE_SERVICE_ROLE_KEY looks like a *publishable* key " +
        "(sb_publishable_...). The Admin API needs the secret key " +
        "(sb_secret_...), from Dashboard -> Project Settings -> API keys.",
    );
  }

  for (const [key, value] of [
    ["SEED_USER_1_EMAIL", email1],
    ["SEED_USER_2_EMAIL", email2],
  ]) {
    if (value && !EMAIL_RE.test(value)) {
      problems.push(`${key} is not a valid email address: ${value}`);
    }
  }

  for (const [key, value] of [
    ["SEED_USER_1_PASSWORD", password1],
    ["SEED_USER_2_PASSWORD", password2],
  ]) {
    if (value && value.length < MIN_PASSWORD_LENGTH) {
      problems.push(
        `${key} is ${value.length} characters; Supabase requires at least ` +
          `${MIN_PASSWORD_LENGTH}. (Length only -- the value is never printed.)`,
      );
    }
  }

  if (email1 && email2 && lower(email1) === lower(email2)) {
    problems.push(
      "SEED_USER_1_EMAIL and SEED_USER_2_EMAIL are the same address " +
        `(${lower(email1)}). This app needs two distinct accounts.`,
    );
  }

  if (problems.length > 0) {
    console.error("\nCannot seed -- fix all of the following:\n");
    for (const p of problems) console.error(`  - ${p}`);
    console.error(
      "\nCopy .env.local.example to .env.local and fill in every value.\n",
    );
    return null;
  }
  return {
    url,
    serviceKey,
    users: [
      { email: email1, password: password1, label: "SEED_USER_1" },
      { email: email2, password: password2, label: "SEED_USER_2" },
    ],
  };
}

// ------------------------------------------------------------------- users

// There is no admin.getUserByEmail(). listUsers() is paginated, so walk it.
async function findUserByEmail(admin, email) {
  const target = lower(email);
  let page = 1;
  for (;;) {
    const { data, error } = await admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const hit = data.users.find((u) => lower(u.email) === target);
    if (hit) return hit;
    // nextPage is null on the last page; the length guard is belt-and-braces
    // against a server that keeps handing back a next page forever.
    if (!data.nextPage || data.users.length === 0) return null;
    page = data.nextPage;
  }
}

async function ensureUser(admin, { email, password }) {
  const existing = await findUserByEmail(admin, email);

  if (!existing) {
    const { data, error } = await admin.createUser({
      email,
      password,
      // Without this the account lands unconfirmed and sign-in fails with
      // email_not_confirmed. createUser() sends no confirmation email, so
      // nothing would ever confirm it.
      email_confirm: true,
    });
    if (error) {
      // Lost a race, or the address exists under a different casing.
      if (
        error.code === "email_exists" ||
        error.code === "user_already_exists"
      ) {
        return { email, action: "already existed" };
      }
      throw error;
    }
    return { email, action: "created", id: data.user.id };
  }

  if (!UPDATE_PASSWORDS) {
    return { email, action: "already existed (password left alone)" };
  }

  const { error } = await admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return { email, action: "password updated", id: existing.id };
}

// ---------------------------------------------------------------- chapters

// PostgREST has no generate_series, and `letter` has no unique constraint, so
// upsert({ onConflict: "letter" }) is unavailable (Postgres 42P10). Read the
// letters that exist, insert only the ones that don't.
async function ensureChapters(db) {
  const { data, error } = await db.from("alphabet_dates").select("letter");
  if (error) throw error;

  const have = new Set((data ?? []).map((r) => norm(r.letter).toUpperCase()));
  const missing = LETTERS.filter((l) => !have.has(l));
  if (missing.length === 0) return { inserted: 0, existing: have.size };

  const { error: insertError } = await db
    .from("alphabet_dates")
    .insert(missing.map((letter) => ({ letter })));
  if (insertError) throw insertError;

  return { inserted: missing.length, existing: have.size, missing };
}

// ------------------------------------------------------------------- main

async function main() {
  const env = readEnv();
  if (!env) return 1;

  const supabase = createClient(env.url, env.serviceKey, {
    // In a one-shot script autoRefreshToken installs a timer that keeps the
    // process alive, and persistSession/detectSessionInUrl are meaningless.
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // This project is hosted-only: there is no local stack, so this ALWAYS
  // targets the real database. Say so out loud.
  console.log(`\nSeeding ${new URL(env.url).host}`);
  console.log(
    UPDATE_PASSWORDS
      ? "Mode: create missing users AND reset existing passwords to match .env.local\n"
      : "Mode: create missing users only (re-run with `-- --update-passwords` to reset)\n",
  );

  console.log("Accounts");
  for (const user of env.users) {
    const result = await ensureUser(supabase.auth.admin, user);
    console.log(`  ${result.email.padEnd(32)} ${result.action}`);
  }

  console.log("\nChapters");
  const chapters = await ensureChapters(supabase);
  console.log(
    chapters.inserted === 0
      ? `  all 26 letters already present -- nothing to do`
      : `  inserted ${chapters.inserted} (${chapters.missing.join(", ")}); ` +
          `${chapters.existing} were already there`,
  );

  const allowed = env.users.map((u) => lower(u.email)).join(",");
  const configured = lower(process.env.ALLOWED_USER_EMAILS);
  if (configured !== allowed) {
    console.log(
      "\nHeads up: ALLOWED_USER_EMAILS does not match the seeded accounts.\n" +
        "The app denies everyone whose email is not on that list, so set:\n" +
        `\n  ALLOWED_USER_EMAILS=${allowed}\n` +
        "\nin .env.local (and in your hosting provider's env vars).",
    );
  }

  console.log("\nDone.\n");
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    // Never dump the whole object: an AuthError's request context can carry
    // the Authorization header.
    console.error(
      `\nSeeding failed: ${error?.message ?? error}` +
        (error?.status ? ` (HTTP ${error.status})` : "") +
        (error?.code ? ` [${error.code}]` : "") +
        "\n",
    );
    process.exit(1);
  });
