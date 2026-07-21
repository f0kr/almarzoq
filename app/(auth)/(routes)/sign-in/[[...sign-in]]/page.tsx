"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useSession } from "@/components/providers/SessionProvider";

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const redirectUrl = searchParams.get("redirect_url") ?? "/";
  const googleError = searchParams.get("error") === "google";
  const verifyError = searchParams.get("error") === "verify";
  const justVerified = searchParams.get("verified") === "1";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setUnverifiedEmail(null);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(values.email);
        }
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      await refresh();
      router.push(redirectUrl.startsWith("/") ? redirectUrl : "/");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    try {
      await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      toast.success("Confirmation email sent — check your inbox.");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue learning">
      {googleError && (
        <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Google sign-in failed. Please try again.
        </p>
      )}
      {verifyError && (
        <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          That confirmation link is invalid or has expired. Sign in below and
          we can send a new one.
        </p>
      )}
      {justVerified && (
        <p className="mb-4 rounded-md bg-sage-pale px-3 py-2 text-sm text-sage-deep">
          Email confirmed. You're all set — sign in to continue.
        </p>
      )}
      <GoogleButton redirectUrl={redirectUrl} />
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          or
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            disabled={isSubmitting}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div>
          <PasswordInput
            placeholder="Password"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-clay hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      {unverifiedEmail && (
        <p className="mt-4 rounded-md bg-paper px-3 py-2 text-center text-sm text-grey">
          Didn&apos;t get the confirmation email?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="font-semibold text-clay hover:underline disabled:opacity-50"
          >
            {isResending ? "Sending…" : "Resend it"}
          </button>
        </p>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
          className="font-semibold text-clay hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
