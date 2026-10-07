import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name,
        passwordHash: await hashPassword(password),
      },
    });

    const token = await createVerificationToken(user.id, "EMAIL_VERIFICATION");
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, user.name, link);

    return NextResponse.json({ requiresVerification: true, email: user.email });
  } catch (error) {
    console.error("[AUTH_SIGN_UP]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
