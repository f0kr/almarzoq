"use client"

import { ConfirmModal } from "@/components/modals/ConfirmModal"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"


interface CategoryDeleteProps {
    categoryId: string;
}

export const CategoryDelete = ({ categoryId }: CategoryDeleteProps) => {

    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)

    const onDelete = async ()=> {
        try{
            setIsLoading(true)

            await axios.delete(`/api/categories/${categoryId}/`)
            toast.success("Category deleted")

            router.refresh()
        }catch(error){
            console.log(error)
            toast.error("Something went wrong")
        }finally{
            setIsLoading(false)
        }
    }


    return (
        <div className="flex items-center">
            <ConfirmModal onConfirm={onDelete}>
            <Button
                size="icon"
                variant='ghost'
                disabled={isLoading}
            >
                <Trash className="h-4 w-4 text-destructive"/>
            </Button>
            </ConfirmModal>
        </div>
    )
}