import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight(req.headers.get("origin") || undefined);
}

export async function POST(req: NextRequest) {
  const respond = async (): Promise<NextResponse> => {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (user && user.passwordHash && !user.emailVerified) {
      const token = await createVerificationToken(user.id, "EMAIL_VERIFICATION");
      const link = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
      await sendVerificationEmail(user.email, user.name, link);
    }

    // Same response either way, so this endpoint can't be used to test
    // which emails have an account.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AUTH_VERIFY_EMAIL_RESEND]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
  };

  return addCorsHeaders(await respond(), req);
}
