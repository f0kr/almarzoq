import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@/lib/auth";
import { uniqueSlug } from "@/lib/journal/slug";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, nameAr, isActive, position } = await req.json();

    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (trimmedName.length < 2) {
      return new NextResponse("Name must be at least 2 characters", { status: 400 });
    }

    const existing = await db.journalCategory.findUnique({
      where: { name: trimmedName },
      select: { id: true },
    });
    if (existing) {
      return new NextResponse("A category with that name already exists", { status: 409 });
    }

    const slug = await uniqueSlug(trimmedName, async (candidate) =>
      Boolean(
        await db.journalCategory.findUnique({
          where: { slug: candidate },
          select: { id: true },
        })
      )
    );

    const category = await db.journalCategory.create({
      data: {
        name: trimmedName,
        nameAr: typeof nameAr === "string" && nameAr.trim() ? nameAr.trim() : null,
        slug,
        isActive: typeof isActive === "boolean" ? isActive : true,
        position: Number.isInteger(position) ? position : 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.log("[JOURNAL_CATEGORY_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
