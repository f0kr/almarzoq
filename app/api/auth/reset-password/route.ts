import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  hashPassword,
  signSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth";
import { consumeVerificationToken } from "@/lib/tokens";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight(req.headers.get("origin") || undefined);
}

export async function POST(req: NextRequest) {
  const respond = async (): Promise<NextResponse> => {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const userId = await consumeVerificationToken(
      parsed.data.token,
      "PASSWORD_RESET"
    );
    if (!userId) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        passwordHash: await hashPassword(parsed.data.newPassword),
        // A password reset proves control of the mailbox even for an
        // account that hadn't verified it yet.
        emailVerified: new Date(),
      },
    });

    const token = await signSessionToken({ userId: user.id, role: user.role });
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("[AUTH_RESET_PASSWORD]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
  };

  return addCorsHeaders(await respond(), req);
}
