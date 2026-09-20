import {
  createServerClient as createSSRClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cookie-aware Supabase client bound to the caller's session (anon key + RLS).
 * Use this to authenticate the caller — e.g. inside a Server Action.
 * For privileged writes, use `createServerClient()` from `@/lib/supabase`
 * (service role) *after* an auth check, since RLS blocks authenticated writes.
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables for server client",
    );
  }

  // Next 16: `cookies()` is async-only; sync access was removed.
  const cookieStore = await cookies();

  return createSSRClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Throws when called during a Server Component render (headers
          // already sent). Harmless here: src/proxy.ts refreshes the
          // session on every /dates/* request. Writes from a Server Action
          // do succeed.
        }
      },
    },
  });
}
