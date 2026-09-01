import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  canonicalize,
  fibConfig,
  isFibConfigured,
  verifySignature,
} from "@/lib/fib";
import { syncFibPayment } from "@/lib/fib-payments";

/**
 * FIB's server-to-server payment notification.
 *
 * This endpoint deliberately grants nothing on its own: it only tells us an
 * order is worth re-checking, and `syncFibPayment` then confirms the outcome
 * with Check Payment Status before any course is unlocked. That is what makes
 * a spoofed callback harmless.
 *
 * Requires a publicly reachable HTTPS URL — on localhost FIB simply cannot
 * reach it and the client-side poller carries the flow instead.
 */
export async function POST(req: NextRequest) {
  if (!isFibConfigured()) {
    return new NextResponse("Not configured", { status: 503 });
  }

  const raw = await req.text();

  let body: Record<string, unknown> | null = null;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const signature = req.headers.get("x-hmac");
  if (signature) {
    const { secret } = fibConfig();
    // Accept either the bytes as sent or their canonical form, since FIB signs
    // the alphabetically-ordered body.
    const canonical = JSON.stringify(canonicalize(body as never));
    const ok =
      verifySignature(raw, signature, secret) ||
      verifySignature(canonical, signature, secret);

    if (!ok) {
      console.warn("[FIB_CALLBACK] invalid signature");
      return new NextResponse("Invalid signature", { status: 401 });
    }
  }

  const orderId =
    (body?.orderId as string | undefined) ??
    ((body?.paymentData as { orderId?: string } | undefined)?.orderId);

  if (!orderId) {
    return new NextResponse("Missing orderId", { status: 400 });
  }

  try {
    await syncFibPayment(orderId);
  } catch (error) {
    console.error("[FIB_CALLBACK]", error);
    // 200 anyway: FIB should not retry forever over a fault on our side, and
    // the poller will reconcile.
  }

  return NextResponse.json({ received: true });
}
