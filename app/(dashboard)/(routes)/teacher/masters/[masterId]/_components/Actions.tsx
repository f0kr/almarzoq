"use client"

import { ConfirmModal } from "@/components/modals/ConfirmModal"
import { Button } from "@/components/ui/button"
import { useConfettiStore } from "@/hooks/use-confetti-store"
import axios from "axios"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

interface ActionsProps {
    disabled: boolean
    masterId: string
    isPublished: boolean
}

export const Actions = ({
    disabled,
    masterId,
    isPublished
}: ActionsProps) => {

    const router = useRouter()

    const confetti = useConfettiStore()

    const [isLoading, setIsLoading] = useState(false)

    const onClick = async ()=>{
        try{
            setIsLoading(true)

            if(isPublished){
                await axios.patch(`/api/masters/${masterId}/unpublish`)
                toast.success("Master unpublished")
            }else{
                await axios.patch(`/api/masters/${masterId}/publish`)
                toast.success("Master published")
                confetti.onOpen()
            }

            router.refresh()

        }catch {
            toast.error("Something went wrong")
        }finally{
            setIsLoading(false)
        }
    }

    const onDelete = async ()=> {
        try{
            setIsLoading(true)

            await axios.delete(`/api/masters/${masterId}`)
            toast.success("Course deleted")

            router.refresh()
            router.push(`/teacher/masters`)
        }catch(error){
            console.log(error)
            toast.error("Something went wrong")
        }finally{
            setIsLoading(false)
        }
    }


    return (
        <div className="flex items-center gap-x-2">
            <Button
                disabled={disabled || isLoading}
                onClick={onClick}
                variant="outline"
                size="sm"
            >
                {isPublished ? "Unpublish" : "Publish"}
            </Button>
            <ConfirmModal onConfirm={onDelete}>
            <Button
                size="sm"
                disabled={isLoading}
            >
                <Trash className="h-4 w-4" />
            </Button>
            </ConfirmModal>
        </div>
    )
}