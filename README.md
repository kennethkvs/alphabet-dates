# Alphabet Dates

A private scrapbook for two people: 26 chapters, one per letter of the
alphabet, each a date you plan, go on, and fill with photos. Built with
Next.js (App Router) and Supabase (auth, Postgres, storage). There is no
signup — exactly two accounts exist, and you create them yourself.

## What you need before you start

- **Node.js 20 or newer** (`node -v` to check) and npm.
- A free [Supabase](https://supabase.com) account. The app talks to a hosted
  Supabase project only — there is no local database to run.
- Optionally the [Supabase CLI](https://supabase.com/docs/guides/cli) for
  applying the database schema from the terminal. You can do the same job
  by pasting SQL into the dashboard instead.

## Setup

### 1. Install dependencies

```bash
git clone <this repo>
cd alphabet-dates
npm install
```

### 2. Create a Supabase project

1. Go to <https://supabase.com/dashboard> and create a new project.
2. Once it's ready, open **Project Settings → API keys** and note:
   - the **Project URL**
   - the **publishable** key (`sb_publishable_...`)
   - the **secret** key (`sb_secret_...`) — treat this like a password.

### 3. Create the storage bucket

Photos live in a private storage bucket, and the app serves them with
short-lived signed URLs. Nothing creates this bucket for you:

1. In the dashboard go to **Storage → Buckets → New bucket**.
2. Name it exactly `alphabet-dates`.
3. Leave **Public bucket** off.

### 4. Turn off self-serve signup

The publishable key is, by design, visible to anyone who loads the site.
With signup left on, a stranger could create their own account in your
project. The app's email allowlist keeps them out of the scrapbook, but this
toggle keeps them out of the auth table entirely:

1. Go to **Authentication → Sign In / Providers → Email**.
2. Turn **"Allow new users to sign up" OFF**.
3. Leave **"Confirm email" ON** — the seed script pre-confirms your two
   accounts, so this never gets in your way.

### 5. Apply the database schema

Migrations live in [`supabase/migrations/`](supabase/migrations/). Apply
them in filename order, either way below.

**With the Supabase CLI:**

```bash
supabase login
supabase link --project-ref <your-project-ref>   # from the dashboard URL
supabase db push --linked
```

**Or with the dashboard:** open **SQL Editor**, and for each file in
`supabase/migrations/` (oldest first) paste its contents and run it.

### 6. Fill in `.env.local`

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in every value:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from step 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key from step 2 |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key from step 2 |
| `ALLOWED_USER_EMAILS` | Both of your email addresses, comma-separated |
| `NEXT_PUBLIC_USER_1_NAME` / `NEXT_PUBLIC_USER_2_NAME` | Your first names — the cover shows the initials |
| `SEED_USER_1_EMAIL` / `SEED_USER_1_PASSWORD` | Login for person 1 (used by the next step) |
| `SEED_USER_2_EMAIL` / `SEED_USER_2_PASSWORD` | Login for person 2 (used by the next step) |

Notes:

- `ALLOWED_USER_EMAILS` must list the same two addresses you use for
  `SEED_USER_*_EMAIL`. If it doesn't, everyone is denied.
- Passwords must be at least 6 characters. Wrap a password in double
  quotes if it contains `#` or spaces.
- `.env.local` is git-ignored. Never commit it.

### 7. Create the two accounts and the 26 chapters

```bash
npm run seed
```

This creates both users in Supabase auth (pre-confirmed, so they can log in
immediately) and inserts one blank chapter for each letter A–Z. It's safe to
run again: existing users and chapters are left alone.

If you ever need to reset a password to whatever's in `.env.local`:

```bash
npm run seed -- --update-passwords
```

### 8. Run it

```bash
npm run dev
```

Open <http://localhost:3000>, click **Open the book**, and sign in with one
of the two accounts.

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run seed` | Create missing accounts and chapters (see step 7) |

## Environment variables, by where they belong

| Variable | Local `.env.local` | Hosting provider | Why |
|---|:-:|:-:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ | Which Supabase project to talk to |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ | Public key for auth and reads |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | Server-only writes and uploads. Never reaches the browser |
| `ALLOWED_USER_EMAILS` | ✓ | ✓ | The only two people allowed in. Checked on every request |
| `NEXT_PUBLIC_USER_1_NAME` / `_2_NAME` | ✓ | ✓ | Initials on the cover. Inlined at **build time** — change them, then rebuild |
| `SEED_USER_*_EMAIL` / `_PASSWORD` | ✓ | **✗** | Plaintext passwords read only by `npm run seed`. The deployed app never uses them |

## Deploying

Any host that runs Next.js works (Vercel is the least setup). Set every
variable from the table above **except** the `SEED_USER_*` ones in the
provider's environment settings, then deploy. Because the `NEXT_PUBLIC_*`
names are baked in during `next build`, they need to be present at build
time, not just at runtime.

The database and storage bucket are already set up from the steps above —
the deployed app uses the same Supabase project as local development.

## How it's put together

```
src/
  app/
    page.tsx              the book cover (initials come from src/lib/names.ts)
    login/                sign-in
    not-invited/          shown to signed-in users who aren't on the allowlist
    dates/                the 26 chapters; [letter]/ is a single chapter
    api/uploads/          resizes photos with sharp and stores them privately
  components/             UI, grouped by feature (auth, dates, alphabet, ui)
  lib/
    access.ts             ALLOWED_USER_EMAILS check (server only)
    names.ts              NEXT_PUBLIC_USER_*_NAME → initials for the cover
    supabase-*.ts         Supabase clients for browser, server, and admin use
  proxy.ts                runs on every request: redirects anyone not signed in
supabase/
  migrations/             database schema, applied in order
  schemas/                declarative copy of the current tables, for reference
  seed.sql                SQL version of the A–Z chapter seed
scripts/seed.mjs          `npm run seed`
```

Two tables: `alphabet_dates` (one row per letter, with title, status,
location, note, and dates) and `photos` (belongs to a chapter; stores the
storage path of an 800px-wide resized copy plus a caption).

## Troubleshooting

**"Not invited" page after logging in** — the email you signed in with isn't
in `ALLOWED_USER_EMAILS`, or that variable isn't set at all (unset means
everyone is denied). Fix the variable and restart `npm run dev`.

**Sign-in says the email isn't confirmed** — the account was created some
other way than `npm run seed`. Run `npm run seed -- --update-passwords`,
which also marks both accounts confirmed.

**`npm run seed` fails with HTTP 403** — `SUPABASE_SERVICE_ROLE_KEY` is
probably the publishable key. It must be the `sb_secret_...` one.

**Photo upload fails** — check that the bucket is named exactly
`alphabet-dates` and that `SUPABASE_SERVICE_ROLE_KEY` is set.

**Cover still shows "A&Z"** — the name variables are read at build time.
Restart `npm run dev` locally, or trigger a new build on your host.

**`.env.local` seems ignored** — it must sit at the repo root, not inside
`src/`.

## Learn more

- [Next.js docs](https://nextjs.org/docs)
- [Supabase docs](https://supabase.com/docs)
