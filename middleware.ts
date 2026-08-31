import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Zero-cost in-memory rate limit (per edge instance, resets on cold start — sufficient for Student)
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/views": { limit: 30, windowMs: 60_000 },
  "/api/comments": { limit: 10, windowMs: 60_000 },
  "/api/join": { limit: 5, windowMs: 60_000 },
  "/api/contact": { limit: 5, windowMs: 60_000 },
  "/api/newsletter": { limit: 10, windowMs: 60_000 },
};
const hitMap = new Map<string, number[]>();
function isRateLimited(pathname: string, ip: string): boolean {
  const cfg = Object.entries(RATE_LIMITS).find(([k]) => pathname.startsWith(k))?.[1];
  if (!cfg) return false;
  const key = `${pathname}:${ip}`;
  const now = Date.now();
  const hits = (hitMap.get(key) || []).filter((t) => now - t < cfg.windowMs);
  hits.push(now);
  hitMap.set(key, hits);
  // Prevent unbounded growth
  if (hitMap.size > 5000) hitMap.clear();
  return hits.length > cfg.limit;
}

export async function middleware(request: NextRequest) {
  // Zero-cost early rate limit — no Supabase call if limited
  const ipEarly = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(request.nextUrl.pathname, ipEarly)) {
    return new NextResponse(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60" },
    });
  }
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes — require authenticated user
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Check profile role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Only superadmin and editor can access admin
    if (!profile || !["superadmin", "editor"].includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from login/register
  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/api/views/:path*", "/api/comments/:path*", "/api/join/:path*", "/api/contact/:path*", "/api/newsletter/:path*"],
};
