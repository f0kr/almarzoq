import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@/lib/auth";
import { uniqueSlug } from "@/lib/journal/slug";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: Readonly<{ params: Promise<{ categoryId: string }> }>
) {
  try {
    const { userId } = await auth();
    const { categoryId } = await params;

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, nameAr, isActive, position } = await req.json();

    const current = await db.journalCategory.findUnique({ where: { id: categoryId } });
    if (!current) return new NextResponse("Not Found", { status: 404 });

    const data: {
      name?: string;
      nameAr?: string | null;
      slug?: string;
      isActive?: boolean;
      position?: number;
    } = {};

    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return new NextResponse("Name must be at least 2 characters", { status: 400 });
      }

      if (trimmedName !== current.name) {
        const clash = await db.journalCategory.findUnique({
          where: { name: trimmedName },
          select: { id: true },
        });
        if (clash) {
          return new NextResponse("A category with that name already exists", { status: 409 });
        }

        data.name = trimmedName;
        // Renaming re-slugs. Nothing links to a category slug yet — the public
        // filters carry ids — so this breaks no URLs.
        data.slug = await uniqueSlug(trimmedName, async (candidate) => {
          const row = await db.journalCategory.findUnique({
            where: { slug: candidate },
            select: { id: true },
          });
          return Boolean(row) && row?.id !== categoryId;
        });
      }
    }

    if (nameAr !== undefined) {
      data.nameAr = typeof nameAr === "string" && nameAr.trim() ? nameAr.trim() : null;
    }
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (Number.isInteger(position)) data.position = position;

    const category = await db.journalCategory.update({
      where: { id: categoryId },
      data,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[JOURNAL_CATEGORY_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: Readonly<{ params: Promise<{ categoryId: string }> }>
) {
  try {
    const { userId } = await auth();
    const { categoryId } = await params;

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Articles keep a nullable categoryId with no cascade, so deleting a
    // category in use would fail on the foreign key. Say so plainly instead,
    // and point at the non-destructive alternative.
    const inUse = await db.article.count({ where: { categoryId } });
    if (inUse > 0) {
      return new NextResponse(
        `${inUse} article${inUse === 1 ? "" : "s"} still use this category. Move them first, or deactivate it instead.`,
        { status: 409 }
      );
    }

    const category = await db.journalCategory.delete({ where: { id: categoryId } });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[JOURNAL_CATEGORY_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
