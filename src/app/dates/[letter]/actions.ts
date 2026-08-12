"use server";

import { refresh } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isAllowedEmail } from "@/lib/access";
import type { AlphabetDateRow, DateStatus } from "@/types/alphabet";

const BUCKET = "alphabet-dates";
const MAX_PHOTO_OPS = 10;
const LIMITS = { title: 200, location: 200, note: 10_000, caption: 200 };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SaveChapterInput = {
  dateId: string;
  title: string | null;
  status: DateStatus | null;
  scheduledAt: string | null; // ISO 8601 or null
  location: string | null;
  note: string | null;
  captions: { id: string; caption: string | null }[]; // only changed ones
  removedPhotoIds: string[];
};

export type SaveChapterResult =
  | { ok: true; date: AlphabetDateRow; deletedPhotoIds: string[] }
  | { ok: false; error: string };

function norm(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export async function saveChapterAction(
  input: SaveChapterInput,
): Promise<SaveChapterResult> {
  // 1. Auth. Render-time gating is not a security boundary — the client is
  // untrusted, and the write below uses the service-role key which bypasses
  // RLS entirely, so this check is the only thing standing in the way.
  const session = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await session.auth.getUser();
  if (authError || !user) {
    return { ok: false, error: "You're not signed in." };
  }
  // Proxy already blocks non-allowlisted users on /dates/*, but Server
  // Functions are POSTs to whatever route they were imported into — a
  // matcher edit or a file move can silently drop that coverage. This write
  // uses the service-role key and bypasses RLS entirely, so re-check here.
  if (!isAllowedEmail(user.email)) {
    return { ok: false, error: "This account can't edit this book." };
  }

  // 2. Validate everything — nothing from the client is trusted.
  const dateId = typeof input?.dateId === "string" ? input.dateId : "";
  if (!UUID.test(dateId)) return { ok: false, error: "Invalid chapter." };

  const status: DateStatus | null =
    input.status === "planned" || input.status === "completed"
      ? input.status
      : null;

  let scheduledAt: string | null = null;
  if (input.scheduledAt) {
    const t = Date.parse(input.scheduledAt);
    if (Number.isNaN(t)) return { ok: false, error: "Invalid date." };
    scheduledAt = new Date(t).toISOString();
  }

  const captions = (Array.isArray(input.captions) ? input.captions : [])
    .filter((c) => c && UUID.test(c.id))
    .slice(0, MAX_PHOTO_OPS)
    .map((c) => ({ id: c.id, caption: norm(c.caption, LIMITS.caption) }));

  const removedPhotoIds = (
    Array.isArray(input.removedPhotoIds) ? input.removedPhotoIds : []
  )
    .filter((id) => typeof id === "string" && UUID.test(id))
    .slice(0, MAX_PHOTO_OPS);

  // Writes go through the service-role client: RLS blocks authenticated
  // writes on these tables entirely, so this is the only client that can
  // actually persist anything. The auth check above is what makes that safe.
  const service = createServerClient();

  // 3. Read the current row: gives a 404 path and the existing completed_at.
  const { data: current, error: readError } = await service
    .from("alphabet_dates")
    .select("id, status, completed_at")
    .eq("id", dateId)
    .maybeSingle();
  if (readError) {
    console.error("[saveChapterAction] read", readError);
    return { ok: false, error: "Couldn't load this chapter." };
  }
  if (!current) {
    return { ok: false, error: "This chapter no longer exists." };
  }

  // completed_at is derived server-side, never sent by the client: set on
  // the first flip to 'completed', preserved on later saves, cleared
  // otherwise.
  const completedAt =
    status === "completed"
      ? (current.completed_at ?? new Date().toISOString())
      : null;

  // 4. Update the date row.
  const { data: updated, error: updateError } = await service
    .from("alphabet_dates")
    .update({
      title: norm(input.title, LIMITS.title),
      status,
      scheduled_at: scheduledAt,
      location: norm(input.location, LIMITS.location),
      note: norm(input.note, LIMITS.note),
      completed_at: completedAt,
    })
    .eq("id", dateId)
    .select()
    .single();
  if (updateError || !updated) {
    console.error("[saveChapterAction] update", updateError);
    return { ok: false, error: "Couldn't save this chapter." };
  }

  // 5. Captions. No multi-row-different-values UPDATE in PostgREST, and
  // upsert would need the NOT NULL columns. At most 5 photos, so parallel
  // single-row updates are fine — the "no Promise.all" rule from the Next
  // docs is about the *client* dispatching multiple Server Actions;
  // server-side fan-out inside one action is fine. `.eq("date_id", dateId)`
  // on every statement is the ownership check.
  if (captions.length > 0) {
    const results = await Promise.all(
      captions.map((c) =>
        service
          .from("photos")
          .update({ caption: c.caption })
          .eq("id", c.id)
          .eq("date_id", dateId),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      console.error("[saveChapterAction] captions", failed.error);
      return {
        ok: false,
        error: "Saved the page, but a caption didn't stick.",
      };
    }
  }

  // 6. Removals. Resolve real storage paths server-side, scoped to this
  // chapter — never trust a path or an unscoped id from the client.
  let deletedPhotoIds: string[] = [];
  if (removedPhotoIds.length > 0) {
    const { data: doomed, error: selError } = await service
      .from("photos")
      .select("id, medium_path")
      .eq("date_id", dateId)
      .in("id", removedPhotoIds);
    if (selError) {
      console.error("[saveChapterAction] photo lookup", selError);
      return { ok: false, error: "Couldn't remove those photos." };
    }

    if (doomed && doomed.length > 0) {
      // Rows first, then storage. A failed storage delete just leaks bytes
      // (invisible); the reverse order would leave rows pointing at missing
      // objects, which breaks <Image> in the UI — strictly worse.
      const { error: delError } = await service
        .from("photos")
        .delete()
        .eq("date_id", dateId)
        .in(
          "id",
          doomed.map((p) => p.id),
        );
      if (delError) {
        console.error("[saveChapterAction] photo delete", delError);
        return { ok: false, error: "Couldn't remove those photos." };
      }
      deletedPhotoIds = doomed.map((p) => p.id);

      const { error: storageError } = await service.storage
        .from(BUCKET)
        .remove(doomed.map((p) => p.medium_path));
      if (storageError) {
        // Non-fatal: the row is gone, the object is orphaned. Log and move on.
        console.error("[saveChapterAction] storage remove", storageError);
      }
    }
  }

  // 7. Re-render the RSC tree. The data lives in Supabase, not the Next
  // data cache, so there's nothing to tag-invalidate: refresh() is the
  // right primitive here (single-arg revalidateTag is deprecated in 16, and
  // the two-arg 'max' form deliberately skips the immediate re-render).
  refresh();

  return { ok: true, date: updated as AlphabetDateRow, deletedPhotoIds };
}
