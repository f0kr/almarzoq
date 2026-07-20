import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createVerificationToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (user && user.passwordHash) {
      const token = await createVerificationToken(user.id, "PASSWORD_RESET");
      const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, user.name, link);
    }

    // Same response either way, so this endpoint can't be used to test
    // which emails have an account.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AUTH_FORGOT_PASSWORD]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
