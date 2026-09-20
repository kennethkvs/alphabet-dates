import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { isAllowedEmail, safeNextPath } from "@/lib/access";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

const PUBLIC_PATHS = ["/", "/login", "/not-invited"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

function isProtectedPage(pathname: string) {
  return pathname.startsWith("/dates");
}

function isProtectedApi(pathname: string) {
  if (pathname.startsWith("/api/alphabet")) return true;
  if (pathname.startsWith("/api/uploads")) return true;
  return false;
}

// NextResponse.redirect() starts from a blank response, so any cookies the
// Supabase client just wrote via setAll() (a rotated refresh token, for
// instance) would otherwise be silently dropped, producing intermittent
// sign-outs.
function redirectPreservingCookies(url: URL, carrying: NextResponse) {
  const redirect = NextResponse.redirect(url);
  for (const cookie of carrying.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // The dead end for signed-in-but-not-allowed users must never redirect
  // anywhere. It is also outside config.matcher below; this early return
  // keeps that invariant true even if a future matcher edit changes that.
  if (pathname === "/not-invited") {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedPage(pathname)) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return redirectPreservingCookies(url, response);
    }

    if (isProtectedApi(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return response;
  }

  // Signed in, but not one of the two allowed accounts. This branch must
  // come before the "authenticated -> bounce off /login" rule below, and it
  // must never redirect a disallowed user to /login itself, or the two
  // rules loop forever (disallowed -> /login -> authenticated -> /dates ->
  // ... ). Letting them fall through to render /login is what breaks the
  // loop, and it's also how they can sign in as the other account.
  if (!isAllowedEmail(user.email)) {
    if (isProtectedApi(pathname)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (isProtectedPage(pathname)) {
      return redirectPreservingCookies(
        new URL("/not-invited", request.url),
        response,
      );
    }
    return response; // includes pathname === "/login": render the form
  }

  if (pathname === "/login") {
    const next = safeNextPath(
      request.nextUrl.searchParams.get("next") ?? undefined,
    );
    return redirectPreservingCookies(new URL(next, request.url), response);
  }

  if (
    isPublicPath(pathname) ||
    isProtectedPage(pathname) ||
    isProtectedApi(pathname)
  ) {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/dates/:path*",
    "/login",
    "/api/alphabet/:path*",
    "/api/uploads/:path*",
  ],
};
