"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function SignUpForm() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const redirectUrl = searchParams.get("redirect_url") ?? "/";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      setSentTo(data.email ?? values.email);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthCard title="Check your email" subtitle="One more step to activate your account">
        <div className="flex flex-col items-center gap-4 text-center">
          <MailCheck className="h-10 w-10 text-clay" />
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-ink">{sentTo}</span>. Click it
            to activate your account, then sign in.
          </p>
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
            className="text-sm font-semibold text-clay hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Start learning with Almrzoq Academy">
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
            placeholder="Full name"
            autoComplete="name"
            disabled={isSubmitting}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
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
            placeholder="Password (8+ characters)"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
          className="font-semibold text-clay hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
