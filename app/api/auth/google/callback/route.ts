import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  signSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

type GoogleIdTokenClaims = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const failure = (reason: string) => {
    console.error("[AUTH_GOOGLE_CALLBACK]", reason);
    return NextResponse.redirect(`${appUrl}/sign-in?error=google`);
  };

  if (!appUrl || !clientId || !clientSecret) {
    return new NextResponse("Google sign-in is not configured", { status: 500 });
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get("google_oauth_state")?.value;
  const redirectPath = req.cookies.get("google_oauth_redirect")?.value ?? "/";

  if (!code || !state || !storedState || state !== storedState) {
    return failure("missing code or state mismatch");
  }

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return failure(`token exchange failed: ${await tokenRes.text()}`);
    }

    const { id_token } = (await tokenRes.json()) as { id_token?: string };
    if (!id_token) return failure("no id_token in token response");

    // The id_token came straight from Google's token endpoint over TLS,
    // so decoding its payload without a signature check is safe (OIDC spec).
    const claims = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64url").toString()
    ) as GoogleIdTokenClaims;

    if (!claims.email || claims.email_verified === false) {
      return failure("Google account has no verified email");
    }

    const email = claims.email.toLowerCase();

    // Match order: googleId first, then email (links pre-migration accounts).
    let user = await db.user.findUnique({ where: { googleId: claims.sub } });
    if (!user) {
      user = await db.user.findUnique({ where: { email } });
      if (user) {
        user = await db.user.update({
          where: { id: user.id },
          data: { googleId: claims.sub },
        });
      }
    }
    if (!user) {
      user = await db.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          name: claims.name ?? null,
          googleId: claims.sub,
        },
      });
    }

    const token = await signSessionToken({ userId: user.id, role: user.role });

    const response = NextResponse.redirect(`${appUrl}${redirectPath}`);
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_oauth_redirect");
    return response;
  } catch (error) {
    return failure(`unexpected error: ${error}`);
  }
}
