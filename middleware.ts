import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

const PUBLIC_PATHS = ["/", "/login"];

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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
      return NextResponse.redirect(url);
    }

    if (isProtectedApi(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dates", request.url));
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
