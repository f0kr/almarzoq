"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface FibEnrollButtonProps {
  courseId: string;
  /** Course price in USD, for the label. */
  price: number;
  /** What the bank will actually charge, in whole IQD. */
  priceIqd: number;
  size?: "sm" | "lg" | "default";
  className?: string;
}

/**
 * Starts a FIB card payment and sends the customer to the bank's hosted
 * 3-D Secure page. The outcome is settled server-side (callback + Check
 * Payment Status) and confirmed on /payment/return — this button never
 * decides whether a payment succeeded.
 */
export const FibEnrollButton = ({
  courseId,
  price,
  priceIqd,
  size = "lg",
  className,
}: FibEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post("/api/payments/fib/checkout", {
        courseId,
        platform: "web",
      });

      // Guard the navigation: `location.assign(undefined)` resolves relative to
      // the current page, so a malformed response would silently send the
      // customer to /courses/undefined instead of the bank.
      const target: unknown = data?.redirectUrl;
      if (typeof target !== "string" || !/^https:\/\//.test(target)) {
        throw new Error("The gateway did not return a checkout URL");
      }
      window.location.assign(target);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ??
          "Could not start the payment. Please try again."
        : error instanceof Error
          ? error.message
          : "Could not start the payment. Please try again.";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <Button
        onClick={onClick}
        disabled={isLoading}
        size={size}
        className={className ?? "w-full"}
      >
        {isLoading ? "Opening secure checkout…" : `Enroll for ${formatPrice(price)}`}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Pay by card — charged as {priceIqd.toLocaleString("en-US")} IQD by First
        Iraqi Bank.
      </p>
    </div>
  );
};
