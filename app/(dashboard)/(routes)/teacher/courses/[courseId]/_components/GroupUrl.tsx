"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GroupUrl } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  initialData: GroupUrl[];
  courseId: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z
    .string()
    .url("Invalid URL")
    .regex(
      /^(https?:\/\/)?((t\.me\/(\+?[A-Za-z0-9_-]+))|(chat\.whatsapp\.com\/[A-Za-z0-9]+))(\?[^#]*)?(#.*)?$/,
      "Must be a valid Telegram or WhatsApp group link",
    ),
});

export default function GroupUrlsForm({ initialData, courseId }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const toggleCreating = () => setIsCreating((p) => !p);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/groupURL`, values);
      toast.success("Group added!");
      form.reset();
      toggleCreating();
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await axios.delete(`/api/courses/${courseId}/groupURL/${id}`);
      toast.success("Group removed");
      router.refresh();
    } catch (err) {
      toast.error("Could not delete");
    }
  };

  return (
    <div className="mt-6 border bg-muted rounded-md p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Group URLs</h3>

        <Button variant="ghost" onClick={toggleCreating}>
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Group
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form
            className="space-y-4 mt-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      {...field}
                      placeholder="VIP Group"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="url"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Link</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="https://t.me/+inviteCode"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Create"
              )}
            </Button>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div
          className={cn(
            "mt-4 space-y-3",
            !initialData.length && "text-muted-foreground italic",
          )}
        >
          {!initialData.length && "No groups added"}

          {initialData.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between bg-white border rounded-md p-3"
            >
              <div className="min-w-0 flex-1 mr-2">
                <p className="font-medium truncate">{g.name}</p>
                <p className="text-xs text-muted-foreground truncate">{g.url}</p>
              </div>

              <Button
                onClick={() => onDelete(g.id)}
                variant="ghost"
                size="icon"
                className="shrink-0"
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
