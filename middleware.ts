import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Same public routes as the previous clerkMiddleware, plus the new
// auth pages/endpoints.
const publicRoutes = [
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/api/auth(.*)",
  "/test(.*)",
  "/api/webhook",
  "/courses(.*)",
  "/",
  "/dashboard",
  "/about-us",
  "/masters(.*)",
  // The journal is public reading. /journal/submit and /journal/mine do their
  // own auth() check and redirect with a redirect_url, which is a better
  // sign-in experience than being bounced by middleware.
  "/journal(.*)",
  // Readers register a view without being signed in.
  "/api/journal/view",
  // Short links printed on story cards. They only ever redirect into /journal,
  // which is public anyway — gating them would bounce a reader who scanned a
  // QR code to a sign-in page.
  "/j/(.*)",
  "/opengraph-image.jpg",
  // Generated share cards. Scrapers are unauthenticated, so a gated card would
  // render as a broken preview in every chat client.
  "/api/og(.*)",
  // UploadThing's upload-complete callback arrives from their ingest servers
  // with no cookie, so this gate would 401 it and the client would hang
  // forever waiting on server data. The endpoint is not actually open: every
  // file route in app/api/uploadthing/core.ts runs auth() in its own
  // middleware, and callbacks are HMAC-verified by createRouteHandler.
  "/api/uploadthing(.*)",
  // Cron endpoints authenticate with CRON_SECRET, not a session. Without this
  // the Bearer token below gets fed to jwtVerify, fails, and the scheduler
  // silently receives 401 on every run.
  "/api/cron(.*)",
  "/api/mobile/home",
];

const publicMatchers = publicRoutes.map(
  (pattern) => new RegExp(`^${pattern}$`)
);

const SESSION_COOKIE = "session";

function isPublicRoute(pathname: string) {
  return publicMatchers.some((matcher) => matcher.test(pathname));
}

async function getSessionToken(req: NextRequest) {
  const cookieToken = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  const authorization = req.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }
  return null;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const token = await getSessionToken(req);
  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      return NextResponse.next();
    } catch {
      // fall through to unauthenticated handling
    }
  }

  if (pathname.startsWith("/api")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const signInUrl = new URL("/sign-in", req.url);
  signInUrl.searchParams.set(
    "redirect_url",
    pathname + req.nextUrl.search
  );
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params.
    // xml/txt keep robots.txt and sitemap.xml out of the auth redirect — without
    // them crawlers get bounced to /sign-in instead of the file.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
