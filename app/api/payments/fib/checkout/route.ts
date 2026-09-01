import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";
import { FibError } from "@/lib/fib";
import {
  CheckoutError,
  assertFibConfigured,
  startFibCheckout,
  type CheckoutPlatform,
} from "@/lib/fib-payments";

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight(req.headers.get("origin") || undefined);
}

/**
 * Start a FIB card payment. Shared by the web app (session cookie) and the
 * Expo app (Authorization: Bearer) — `auth()` reads both.
 *
 * Body: { courseId: string, platform?: "web" | "native" }
 * 200:  { orderId, paymentId, redirectUrl, amount, currency }
 *
 * The client must send the customer to `redirectUrl`, then poll
 * GET /api/payments/fib/{orderId} until it reports a terminal status.
 */
export async function POST(req: NextRequest) {
  try {
    assertFibConfigured();

    const { userId } = await auth();
    if (!userId) {
      return addCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        req
      );
    }

    const body = await req.json().catch(() => null);
    const courseId = body?.courseId;
    if (typeof courseId !== "string" || !courseId) {
      return addCorsHeaders(
        NextResponse.json({ error: "courseId is required" }, { status: 400 }),
        req
      );
    }

    const platform: CheckoutPlatform =
      body?.platform === "native" ? "native" : "web";

    const result = await startFibCheckout({ userId, courseId, platform });
    return addCorsHeaders(NextResponse.json(result), req);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return addCorsHeaders(
        NextResponse.json({ error: error.message }, { status: error.status }),
        req
      );
    }
    if (error instanceof FibError) {
      console.error("[FIB_CHECKOUT]", error.code, error.message);
      return addCorsHeaders(
        NextResponse.json(
          { error: "The payment gateway rejected this request" },
          { status: 502 }
        ),
        req
      );
    }
    console.error("[FIB_CHECKOUT]", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      req
    );
  }
}
