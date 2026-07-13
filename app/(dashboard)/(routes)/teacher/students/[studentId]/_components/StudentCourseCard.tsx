"use client"

import Image from "next/image"
import { formatPrice } from "@/lib/format"
import { ConfirmModal } from "@/components/modals/ConfirmModal"
import toast from "react-hot-toast"
import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CourseCardProps {
id: string
title: string
imageUrl: string
price: number
masters: string[],
studentId: string
}


export const StudentCourseCard = ({
    id,
    title,
    imageUrl,
    price,
    masters,
    studentId
}: CourseCardProps)=>{
    const masterLabel = masters?.length ? masters.join(", ") : "Unknown master"
    
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const onSubmit = async ()=> {
      try{
        setIsLoading(true)
        axios.post("/api/student", {
          studentId,
          courseId: id
        })
        toast.success("Student added.")
        router.push(`/teacher/students/${studentId}/${id}/group`)
      }catch(error){
        console.log(error)
        toast.error("something went wrong")
      }finally{
        setIsLoading(false)
      }
    }


    return(
      <ConfirmModal onConfirm={onSubmit}>
            <div className={`group h-full cursor-pointer bg-card border border-beige rounded-2xl p-2.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(39,39,39,0.10)] ${
    isLoading ? "opacity-50 cursor-not-allowed" : ""
  }`}>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                   <Image
                   fill
                   className="object-cover"
                   alt={title}
                   src={imageUrl || "https://via.placeholder.com/640x360.png?text=No+Image"}
                   />
                </div>
                <div className="flex flex-col pt-2.5 px-1.5 pb-1">
                  <div className="text-xs text-grey">
                    {masterLabel}
                  </div>
                  <div className="font-serif font-semibold text-base group-hover:text-primary transition line-clamp-2 mt-0.5 mb-1.5">
                    {title}
                  </div>
                  {
                    price === 0 ? (
                        <span className="inline-block w-fit px-3 py-1 text-xs font-semibold bg-sage text-sage-pale rounded-full">
                            Free
                        </span>
                    ) : (
                        <p className="text-md md:text-sm font-medium text-foreground">
                            {formatPrice(price)}
                        </p>
                    )
                  }
                </div>
            </div>
          </ConfirmModal>
    )
}
