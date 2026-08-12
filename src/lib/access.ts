/**
 * Access rules for a two-person app. No table, no join: the two addresses
 * live in ALLOWED_USER_EMAILS (comma-separated) and are compared
 * case-insensitively against the signed-in user's email.
 *
 * Server-only — never import from a Client Component. ALLOWED_USER_EMAILS
 * has no NEXT_PUBLIC_ prefix precisely so it cannot reach the browser bundle.
 */

function allowedEmails(): Set<string> {
  return new Set(
    (process.env.ALLOWED_USER_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false; // phone-only / anonymous users have no email
  const allowed = allowedEmails();
  if (allowed.size === 0) {
    // Fail CLOSED. An unset or empty allowlist locks everyone out rather
    // than letting everyone in. Set ALLOWED_USER_EMAILS before deploying.
    console.error(
      "[access] ALLOWED_USER_EMAILS is not set — denying all access.",
    );
    return false;
  }
  return allowed.has(email.trim().toLowerCase());
}

/**
 * `next` arrives from the query string, so it is attacker-controlled.
 * Only ever hand it to router.push()/redirect() after clamping it to a path
 * inside this app. /dates is the only protected area, so that is the whole
 * legitimate range.
 */
export function safeNextPath(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return "/dates";
  if (value === "/dates" || value.startsWith("/dates/")) return value;
  return "/dates";
}
