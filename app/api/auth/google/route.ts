import { NextRequest, NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!clientId || !appUrl) {
    console.error("[AUTH_GOOGLE] GOOGLE_CLIENT_ID or NEXT_PUBLIC_APP_URL not set");
    return new NextResponse("Google sign-in is not configured", { status: 500 });
  }

  const state = crypto.randomUUID();
  const redirectUrl = req.nextUrl.searchParams.get("redirect_url") ?? "/";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const response = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };
  response.cookies.set("google_oauth_state", state, cookieOptions);
  // Only allow same-site relative paths to prevent open redirects.
  response.cookies.set(
    "google_oauth_redirect",
    redirectUrl.startsWith("/") && !redirectUrl.startsWith("//") ? redirectUrl : "/",
    cookieOptions
  );
  return response;
}
