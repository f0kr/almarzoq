"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

interface PasswordFormProps {
    /** Google-only accounts have no password yet and set one without the old value. */
    hasPassword: boolean;
    email: string;
}

export default function PasswordForm({ hasPassword, email }: PasswordFormProps) {
    const formSchema = z
        .object({
            currentPassword: z.string(),
            newPassword: z
                .string()
                .min(8, "Password must be at least 8 characters")
                .max(72),
            confirmPassword: z.string(),
        })
        .refine((data) => !hasPassword || data.currentPassword.length > 0, {
            message: "Current password is required",
            path: ["currentPassword"],
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values: FormValues) => {
        try {
            await axios.patch("/api/profile/password", {
                ...(hasPassword && { currentPassword: values.currentPassword }),
                newPassword: values.newPassword,
            });
            toast.success(hasPassword ? "Password updated" : "Password set");
            form.reset();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : null;
            toast.error(message ?? "Something went wrong");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {!hasPassword && (
                    <p className="rounded-xl border border-beige bg-paper px-4 py-3 text-sm text-grey">
                        You signed up with Google. Set a password to also sign in with
                        your email address.
                    </p>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                    {hasPassword && (
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Current password</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            autoComplete="current-password"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-grey">
                                        Forgot your current password?{" "}
                                        <Link
                                            href={`/forgot-password?email=${encodeURIComponent(email)}`}
                                            className="font-semibold text-clay hover:underline"
                                        >
                                            Reset it
                                        </Link>
                                    </p>
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New password</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        autoComplete="new-password"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm new password</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        autoComplete="new-password"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" variant="soft" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {hasPassword ? "Update password" : "Set password"}
                </Button>
            </form>
        </Form>
    );
}
