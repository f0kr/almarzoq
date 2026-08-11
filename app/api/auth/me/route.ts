import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight(req.headers.get("origin") || undefined);
}

export async function GET(req: NextRequest) {
  const respond = async (): Promise<NextResponse> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl,
      },
    });
  } catch (error) {
    console.error("[AUTH_ME]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
  };

  return addCorsHeaders(await respond(), req);
}
