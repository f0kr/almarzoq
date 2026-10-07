import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { auth, hashPassword, verifyPassword } from "@/lib/auth";

const passwordSchema = z.object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const parsed = passwordSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { message: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = parsed.data;

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Google-only accounts have no password yet, so they set one without
        // proving the old value.
        if (user.passwordHash) {
            if (!currentPassword) {
                return NextResponse.json(
                    { message: "Current password is required" },
                    { status: 400 }
                );
            }
            const valid = await verifyPassword(currentPassword, user.passwordHash);
            if (!valid) {
                return NextResponse.json(
                    { message: "Current password is incorrect" },
                    { status: 400 }
                );
            }
        }

        await db.user.update({
            where: { id: userId },
            data: { passwordHash: await hashPassword(newPassword) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PROFILE_PASSWORD_PATCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
