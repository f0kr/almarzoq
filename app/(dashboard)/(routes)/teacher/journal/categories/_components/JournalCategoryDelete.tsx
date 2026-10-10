"use client"

import { ConfirmModal } from "@/components/modals/ConfirmModal"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

interface JournalCategoryDeleteProps {
  categoryId: string
}

export const JournalCategoryDelete = ({ categoryId }: JournalCategoryDeleteProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const onDelete = async () => {
    try {
      setIsLoading(true)
      await axios.delete(`/api/journal/categories/${categoryId}`)
      toast.success("Category deleted")
      router.refresh()
    } catch (error) {
      // A 409 here means articles still reference it — that sentence is more
      // useful to the admin than "something went wrong".
      const message =
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Something went wrong"
      toast.error(message)
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center">
      <ConfirmModal onConfirm={onDelete}>
        <Button size="icon" variant="ghost" disabled={isLoading}>
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </ConfirmModal>
    </div>
  )
}
