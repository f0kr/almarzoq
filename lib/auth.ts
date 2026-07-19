import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  userId: string;
  role: Role;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return { userId: payload.sub, role: (payload.role as Role) ?? "STUDENT" };
  } catch {
    return null;
  }
}

/**
 * Drop-in replacement for Clerk's `auth()`: returns `{ userId }` where
 * userId is null when not signed in. Reads the httpOnly session cookie
 * (web) or the `Authorization: Bearer` header (mobile).
 */
export async function auth(): Promise<{
  userId: string | null;
  role: Role | null;
}> {
  const token = await getSessionTokenFromRequest();
  if (!token) return { userId: null, role: null };

  const session = await verifySessionToken(token);
  if (!session) return { userId: null, role: null };

  return { userId: session.userId, role: session.role };
}

async function getSessionTokenFromRequest(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  const headerStore = await headers();
  const authorization = headerStore.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return null;
}

/**
 * Replacement for Clerk's `currentUser()`: the full DB user for the
 * current session, or null.
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
