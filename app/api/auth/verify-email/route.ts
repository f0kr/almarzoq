import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeVerificationToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const token = req.nextUrl.searchParams.get("token");

  const fail = (reason: string) => {
    console.error("[VERIFY_EMAIL]", reason);
    return NextResponse.redirect(`${appUrl}/sign-in?error=verify`);
  };

  if (!token) return fail("missing token");

  const userId = await consumeVerificationToken(token, "EMAIL_VERIFICATION");
  if (!userId) return fail("invalid or expired token");

  await db.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(`${appUrl}/sign-in?verified=1`);
}
