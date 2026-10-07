"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/components/providers/SessionProvider";

const formSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
    dateOfBirth: z.string(),
    phone: z
        .string()
        .trim()
        .refine((v) => v === "" || /^\+?[0-9\s-]{7,20}$/.test(v), "Enter a valid phone number"),
    gender: z.enum(["MALE", "FEMALE", "UNSPECIFIED", "NONE"]),
    bio: z.string().trim().max(500, "Bio must be 500 characters or fewer"),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
    initialData: {
        name: string | null;
        dateOfBirth: string | null;
        phone: string | null;
        gender: "MALE" | "FEMALE" | "UNSPECIFIED" | null;
        bio: string | null;
    };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
    const router = useRouter();
    const { refresh } = useSession();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name ?? "",
            dateOfBirth: initialData.dateOfBirth ?? "",
            phone: initialData.phone ?? "",
            gender: initialData.gender ?? "NONE",
            bio: initialData.bio ?? "",
        },
    });

    const { isSubmitting, isDirty } = form.formState;
    const bioLength = form.watch("bio")?.length ?? 0;

    const onSubmit = async (values: FormValues) => {
        try {
            await axios.patch("/api/profile", {
                name: values.name,
                dateOfBirth: values.dateOfBirth
                    ? new Date(`${values.dateOfBirth}T00:00:00.000Z`).toISOString()
                    : null,
                phone: values.phone || null,
                gender: values.gender === "NONE" ? null : values.gender,
                bio: values.bio || null,
            });
            toast.success("Profile updated");
            form.reset(values);
            await refresh();
            router.refresh();
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
                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full name</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isSubmitting}
                                        placeholder="e.g. Sara Al Marzoq"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone number</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isSubmitting}
                                        placeholder="+971 50 123 4567"
                                        inputMode="tel"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date of birth</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        max={new Date().toISOString().slice(0, 10)}
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
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isSubmitting}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="NONE">Not set</SelectItem>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="UNSPECIFIED">
                                            Prefer not to say
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>About me</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={4}
                                    disabled={isSubmitting}
                                    placeholder="Tell your masters a little about yourself and what you want to learn."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="text-right tabular-nums">
                                {bioLength}/500
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center gap-3">
                    <Button type="submit" variant="soft" disabled={isSubmitting || !isDirty}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                    </Button>
                    {isDirty && !isSubmitting && (
                        <Button
                            type="button"
                            variant="link"
                            className="text-grey no-underline"
                            onClick={() => form.reset()}
                        >
                            Discard
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}
