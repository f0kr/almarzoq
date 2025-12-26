"use client"

import { ConfirmModal } from "@/components/modals/ConfirmModal"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"


interface MasterDeleteProps {
    masterId: string;
}

export const MasterDelete = ({ masterId }: MasterDeleteProps) => {

    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)

    const onDelete = async ()=> {
        try{
            setIsLoading(true)

            await axios.delete(`/api/masters/${masterId}/`)
            toast.success("Master deleted")

            router.refresh()
        }catch(error){
            console.log(error)
            toast.error("Something went wrong")
        }finally{
            setIsLoading(false)
        }
    }


    return (
        <div className="flex items-center gap-x-2">
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