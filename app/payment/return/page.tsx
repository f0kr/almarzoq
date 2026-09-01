import Link from "next/link";

import { Button } from "@/components/ui/button";
import { syncFibPayment } from "@/lib/fib-payments";

import { NativeHandoff } from "./_components/NativeHandoff";

export const dynamic = "force-dynamic";

export const metadata = { title: "Payment", robots: { index: false } };

/**
 * Where FIB sends the customer's browser after 3-D Secure.
 *
 * The redirect itself proves nothing, so this page asks Check Payment Status
 * (via `syncFibPayment`) before showing an outcome. It is intentionally
 * unauthenticated — the in-app browser used by the Expo app carries neither
 * the session cookie nor the bearer token — which is safe because an 18-digit
 * order id is unguessable and nothing here reveals more than that order.
 */
export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  let status: "SUCCESS" | "FAILED" | "PENDING" = "PENDING";
  let courseId: string | null = null;
  let platform: "web" | "native" = "web";
  let failureReason: string | null = null;

  if (orderId) {
    try {
      const result = await syncFibPayment(orderId);
      status = result.granted ? "SUCCESS" : result.status;
      courseId = result.courseId;
      failureReason = result.failureReason;
      platform = result.platform;
    } catch {
      failureReason = "We could not find that payment.";
      status = "FAILED";
    }
  } else {
    status = "FAILED";
    failureReason = "Missing order reference.";
  }

  const copy = {
    SUCCESS: {
      title: "Payment received",
      body: "Your enrollment is confirmed. The course is unlocked and ready.",
    },
    PENDING: {
      title: "Payment is still processing",
      body: "The bank has not confirmed this payment yet. It usually settles within a minute — this page is safe to refresh.",
    },
    FAILED: {
      title: "Payment was not completed",
      body: failureReason ?? "The bank declined this payment. No money was taken.",
    },
  }[status];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="w-full rounded-2xl border border-beige bg-card p-8">
        <h1 className="font-serif text-2xl font-semibold">{copy.title}</h1>
        <p className="mt-3 text-sm text-grey">{copy.body}</p>

        <div className="mt-6 flex flex-col items-center gap-3">
          {platform === "native" ? (
            <NativeHandoff
              deepLink={`almarzoq://payment-return?orderId=${encodeURIComponent(
                orderId ?? ""
              )}&status=${status}`}
            />
          ) : courseId ? (
            <Link href={`/courses/${courseId}`} className="w-full">
              <Button className="w-full">
                {status === "SUCCESS" ? "Start learning" : "Back to the course"}
              </Button>
            </Link>
          ) : (
            <Link href="/" className="w-full">
              <Button className="w-full">Back to Almrzoq</Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
