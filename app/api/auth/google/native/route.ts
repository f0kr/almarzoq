import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { db } from "@/lib/db";
import {
  signSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

/**
 * Native Google sign-in for the mobile app.
 *
 * Unlike the web OAuth callback (which trusts an id_token it fetched itself
 * from Google over TLS), here the id_token arrives FROM the client, so we must
 * cryptographically verify its signature, issuer, and audience before trusting
 * any claim. The audience must match one of our configured Google OAuth client
 * IDs (iOS / Android / web / Expo).
 */
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

const allowedAudiences = (): string[] =>
  [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_EXPO_CLIENT_ID,
  ].filter((value): value is string => Boolean(value));

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight(req.headers.get("origin") || undefined);
}

export async function POST(req: NextRequest) {
  const respond = async (): Promise<NextResponse> => {
    try {
      const audiences = allowedAudiences();
      if (audiences.length === 0) {
        console.error("[AUTH_GOOGLE_NATIVE] No Google client IDs configured");
        return NextResponse.json(
          { error: "Google sign-in is not configured" },
          { status: 500 }
        );
      }

      const { idToken } = await req.json();
      if (!idToken || typeof idToken !== "string") {
        return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
      }

      let payload;
      try {
        ({ payload } = await jwtVerify(idToken, JWKS, {
          issuer: ["https://accounts.google.com", "accounts.google.com"],
          audience: audiences,
        }));
      } catch (err) {
        console.error("[AUTH_GOOGLE_NATIVE] token verify failed", err);
        return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
      }

      const sub = payload.sub;
      const email =
        typeof payload.email === "string" ? payload.email.toLowerCase() : null;
      const emailVerified = payload.email_verified !== false;
      const name = typeof payload.name === "string" ? payload.name : null;
      const picture = typeof payload.picture === "string" ? payload.picture : null;

      if (!sub || !email || !emailVerified) {
        return NextResponse.json(
          { error: "Google account has no verified email" },
          { status: 401 }
        );
      }

      // Match order: googleId first, then email (links pre-existing accounts).
      let user = await db.user.findUnique({ where: { googleId: sub } });
      if (!user) {
        user = await db.user.findUnique({ where: { email } });
        if (user) {
          user = await db.user.update({
            where: { id: user.id },
            data: {
              googleId: sub,
              emailVerified: user.emailVerified ?? new Date(),
              imageUrl: user.imageUrl ?? picture,
            },
          });
        }
      }
      if (!user) {
        user = await db.user.create({
          data: {
            id: crypto.randomUUID(),
            email,
            name,
            googleId: sub,
            imageUrl: picture,
            // Google already verified this address.
            emailVerified: new Date(),
          },
        });
      }

      const token = await signSessionToken({ userId: user.id, role: user.role });
      const response = NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          imageUrl: user.imageUrl,
        },
      });
      response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
      return response;
    } catch (error) {
      console.error("[AUTH_GOOGLE_NATIVE]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };

  return addCorsHeaders(await respond(), req);
}
