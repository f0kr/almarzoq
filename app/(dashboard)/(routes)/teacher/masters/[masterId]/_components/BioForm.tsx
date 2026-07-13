"use client"

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { Editor } from "@/components/Editor"
import { Preview } from "@/components/Preview"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    bio: z.string().optional()
})

interface BioFormProps {
    initialData: {
        bio: string | null
    }
    masterId: string
}

export default function BioForm({ initialData, masterId }: BioFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bio: initialData.bio || ""
        }
    })

    const { isSubmitting, isValid } = form.formState

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/masters/${masterId}`, values)
            toast.success("Master bio updated")
            setIsEditing(false)
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="mt-6 border bg-muted rounded-lg p-4">
            <div className="font-medium flex items-center justify-between">
                Master Bio
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="ghost"
                >
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <div className={cn(
                    "text-sm mt-2",
                    !initialData.bio && "text-muted-foreground italic"
                )}>
                    {!initialData.bio ? "No bio" : (
                        <Preview value={initialData.bio} />
                    )}
                </div>
            )}
            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Editor
                                            value={field.value ?? ""}
                                            onChange={(v: string) => field.onChange(v)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            disabled={!isValid || isSubmitting}
                            type="submit"
                        >
                            Save
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    )
}
