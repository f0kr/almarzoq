"use client"

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { Pencil } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
    title: z.string().optional()
})

interface TitleFormProps {
    initialData: {
        title: string | null
    }
    masterId: string
}

export default function TitleForm({ initialData, masterId }: TitleFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData.title || ""
        }
    })

    const { isSubmitting, isValid } = form.formState

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/masters/${masterId}`, values)
            toast.success("Master title updated")
            setIsEditing(false)
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="mt-6 border bg-muted rounded-lg p-4">
            <div className="font-medium flex items-center justify-between">
                Master Title
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
                    <p className={cn(
                        "text-sm mt-2",
                        !initialData.title && "text-muted-foreground italic"
                    )}>
                        {!initialData.title ? "No title" : initialData.title}
                    </p>
            )}
            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input maxLength={50} disabled={isSubmitting} placeholder="e.g. Bachelor's in Fine Art from UOB" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
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
