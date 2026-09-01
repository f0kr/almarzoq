import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";
import { FibError } from "@/lib/fib";
import { CheckoutError, syncFibPayment } from "@/lib/fib-payments";

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight(req.headers.get("origin") || undefined);
}

/**
 * Poll a payment's outcome. Scoped to the signed-in user, so one student can
 * never read another's payment.
 *
 * FIB's recommended cadence: wait 15s after initiating, then poll every 5s
 * until terminal. `granted` is the only field worth gating access on.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return addCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        req
      );
    }

    const { orderId } = await params;
    const result = await syncFibPayment(orderId, { userId });

    return addCorsHeaders(NextResponse.json(result), req);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return addCorsHeaders(
        NextResponse.json({ error: error.message }, { status: error.status }),
        req
      );
    }
    if (error instanceof FibError) {
      console.error("[FIB_STATUS]", error.code, error.message);
      // Transient gateway trouble — the client should keep polling.
      return addCorsHeaders(
        NextResponse.json(
          { status: "PENDING", granted: false, failureReason: null },
          { status: 200 }
        ),
        req
      );
    }
    console.error("[FIB_STATUS]", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      req
    );
  }
}
