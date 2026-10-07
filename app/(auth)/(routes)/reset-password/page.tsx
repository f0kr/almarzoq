"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthCard } from "@/components/auth/AuthCard";
import { useSession } from "@/components/providers/SessionProvider";

const formSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast.error("This reset link is invalid or has expired.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: values.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      toast.success("Password updated");
      await refresh();
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthCard title="Invalid link" subtitle="This password reset link is invalid or has expired">
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="font-semibold text-clay hover:underline">
            Request a new link
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <PasswordInput
            placeholder="New password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...form.register("newPassword")}
          />
          {form.formState.errors.newPassword && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.newPassword.message}
            </p>
          )}
        </div>
        <div>
          <PasswordInput
            placeholder="Confirm new password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
