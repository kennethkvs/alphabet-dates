/**
 * The two people this book belongs to. Their first names live in
 * NEXT_PUBLIC_USER_1_NAME / NEXT_PUBLIC_USER_2_NAME so the cover can be
 * personalised without editing source.
 *
 * NEXT_PUBLIC_ on purpose: the cover is a Client Component, and first names
 * are not secrets. Next.js inlines these at build time, so they must be set
 * wherever `next build` runs — a later change needs a rebuild.
 *
 * Each `process.env.NEXT_PUBLIC_*` reference is spelled out literally (no
 * dynamic lookup) because that is the only form Next.js will inline.
 */

const FALLBACK_1 = "A";
const FALLBACK_2 = "Z";

function firstName(raw: string | undefined, fallback: string): string {
  const name = (raw ?? "").trim();
  return name || fallback;
}

export const USER_1_NAME = firstName(
  process.env.NEXT_PUBLIC_USER_1_NAME,
  FALLBACK_1,
);
export const USER_2_NAME = firstName(
  process.env.NEXT_PUBLIC_USER_2_NAME,
  FALLBACK_2,
);

/** First character of a name — `Array.from` so a surrogate-pair initial stays intact. */
function initialOf(name: string): string {
  return Array.from(name)[0] ?? "";
}

/** Uppercase initials, e.g. "A&Z" for the wax seal. */
export const INITIALS = `${initialOf(USER_1_NAME)}&${initialOf(USER_2_NAME)}`.toUpperCase();

/** Lowercase, spaced initials, e.g. "a & z" for the handwritten touches. */
export const INITIALS_HAND =
  `${initialOf(USER_1_NAME)} & ${initialOf(USER_2_NAME)}`.toLowerCase();
