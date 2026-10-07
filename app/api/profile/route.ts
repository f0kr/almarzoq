import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const profileSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(60).optional(),
    imageUrl: z.string().url().nullable().optional(),
    dateOfBirth: z.string().datetime().nullable().optional(),
    phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number")
        .nullable()
        .optional(),
    bio: z.string().trim().max(500, "Bio must be 500 characters or fewer").nullable().optional(),
    gender: z.enum(["MALE", "FEMALE", "UNSPECIFIED"]).nullable().optional(),
});

export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const parsed = profileSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 }
            );
        }

        const { dateOfBirth, ...rest } = parsed.data;

        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 0 || age > 120) {
                return NextResponse.json(
                    { message: "Enter a valid date of birth" },
                    { status: 400 }
                );
            }
        }

        const user = await db.user.update({
            where: { id: userId },
            data: {
                ...rest,
                ...(dateOfBirth !== undefined && {
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                imageUrl: true,
                dateOfBirth: true,
                phone: true,
                bio: true,
                gender: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("[PROFILE_PATCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
