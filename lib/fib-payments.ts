/**
 * Orchestration around `lib/fib.ts`: turns a course + user into a FIB card
 * checkout, and reconciles the outcome into a `Purchase`.
 *
 * Access is granted in exactly one place — `syncFibPayment` — and only after
 * Check Payment Status says SUCCESS. The callback and the browser redirect are
 * treated as hints that it is worth asking; never as proof of payment.
 */
import { db } from "@/lib/db";
import {
  FibError,
  checkPaymentStatus,
  fibConfig,
  initiatePayment,
  newOrderId,
} from "@/lib/fib";
import type { FibPayment } from "@prisma/client";

/** Courses are priced in USD (the Stripe legacy); FIB charges whole IQD. */
export const IQD_PER_USD = Number(process.env.FIB_IQD_PER_USD ?? 1310);

export function usdToIqd(priceUsd: number): number {
  return Math.round(priceUsd * IQD_PER_USD);
}

export function appUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error("NEXT_PUBLIC_APP_URL is not set");
  return url.replace(/\/+$/, "");
}

export type CheckoutPlatform = "web" | "native";

export class CheckoutError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

/**
 * Create a FIB payment for `courseId` on behalf of `userId` and return the
 * hosted 3-D Secure URL the customer must be sent to.
 */
export async function startFibCheckout(input: {
  userId: string;
  courseId: string;
  platform: CheckoutPlatform;
}) {
  const { userId, courseId, platform } = input;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true },
  });
  if (!user) throw new CheckoutError("Unauthorized", 401);

  const course = await db.course.findFirst({
    where: { id: courseId, isPublished: true },
    select: { id: true, title: true, price: true },
  });
  if (!course) throw new CheckoutError("Course not found", 404);

  if (!course.price || course.price <= 0) {
    throw new CheckoutError("This course is free", 400);
  }

  const existing = await db.purchase.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) throw new CheckoutError("Already purchased this course", 400);

  const amount = usdToIqd(course.price);
  if (amount <= 0) throw new CheckoutError("Invalid course price", 400);

  const orderId = newOrderId();
  const base = appUrl();

  // Persist BEFORE calling FIB: if `initiate` succeeds but the response never
  // reaches us, the row is still there for the reconciler to find.
  const payment = await db.fibPayment.create({
    data: { orderId, userId, courseId, amount, platform },
  });

  try {
    const { redirectUrl, paymentId } = await initiatePayment({
      orderId,
      amount,
      currency: "IQD",
      // Where FIB sends the customer's browser once 3-D Secure is done.
      redirectUrl: `${base}/payment/return?orderId=${orderId}`,
      // Where FIB POSTs the outcome. Must be publicly reachable HTTPS —
      // on localhost it simply never fires and polling carries the flow.
      callbackUrl: `${base}/api/payments/fib/callback`,
      clientInfo: {
        clientName: user.name || "Almrzoq Student",
        mobilePhone: user.phone || "",
        addressLine1: "Erbil",
        addressLine2: "Iraq",
        email: user.email,
      },
    });

    await db.fibPayment.update({
      where: { id: payment.id },
      data: { paymentId },
    });

    return { orderId, paymentId, redirectUrl, amount, currency: "IQD" };
  } catch (error) {
    await db.fibPayment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failureReason:
          error instanceof FibError ? error.message : "Could not start payment",
      },
    });
    throw error;
  }
}

export type SyncResult = {
  status: FibPayment["status"];
  courseId: string;
  platform: CheckoutPlatform;
  /** True once the `Purchase` row exists — the only thing clients should gate on. */
  granted: boolean;
  failureReason: string | null;
};

/**
 * Ask FIB for the truth about `orderId`, persist it, and grant the course on
 * SUCCESS. Idempotent and safe to call from the callback and the poller at the
 * same time.
 */
export async function syncFibPayment(
  orderId: string,
  opts: { userId?: string } = {}
): Promise<SyncResult> {
  const payment = await db.fibPayment.findUnique({ where: { orderId } });
  if (!payment) throw new CheckoutError("Payment not found", 404);
  if (opts.userId && payment.userId !== opts.userId) {
    throw new CheckoutError("Payment not found", 404);
  }

  const granted = async () =>
    !!(await db.purchase.findUnique({
      where: {
        userId_courseId: { userId: payment.userId, courseId: payment.courseId },
      },
    }));

  // Terminal states never change — don't spend a token re-asking.
  if (payment.status !== "PENDING") {
    return {
      status: payment.status,
      courseId: payment.courseId,
      platform: payment.platform as CheckoutPlatform,
      granted: await granted(),
      failureReason: payment.failureReason,
    };
  }

  if (!payment.paymentId) {
    return {
      status: "PENDING",
      courseId: payment.courseId,
      platform: payment.platform as CheckoutPlatform,
      granted: false,
      failureReason: null,
    };
  }

  const result = await checkPaymentStatus({
    orderId,
    paymentId: payment.paymentId,
  });

  // 404 / no transaction yet — the customer is still on the 3-D Secure page.
  if (!result) {
    return {
      status: "PENDING",
      courseId: payment.courseId,
      platform: payment.platform as CheckoutPlatform,
      granted: false,
      failureReason: null,
    };
  }

  const paid = result.paymentData?.status === "SUCCESS";

  const updated = await db.fibPayment.update({
    where: { id: payment.id },
    data: {
      status: paid ? "SUCCESS" : "FAILED",
      reference: result.paymentData?.reference ?? null,
      authorizationCode: result.paymentData?.authorizationCode ?? null,
      paidAt: paid ? new Date() : null,
      failureReason: paid ? null : result.description || "Payment declined",
    },
  });

  if (paid) {
    // Idempotent: a concurrent callback + poll must not double-insert.
    await db.purchase.upsert({
      where: {
        userId_courseId: { userId: payment.userId, courseId: payment.courseId },
      },
      create: { userId: payment.userId, courseId: payment.courseId },
      update: {},
    });
  }

  return {
    status: updated.status,
    courseId: updated.courseId,
    platform: updated.platform as CheckoutPlatform,
    granted: paid,
    failureReason: updated.failureReason,
  };
}

/** Re-exported so routes can 503 cleanly when the gateway isn't configured. */
export function assertFibConfigured() {
  try {
    fibConfig();
  } catch (error) {
    throw new CheckoutError(
      "Card payments are not configured on this server",
      503
    );
  }
}
