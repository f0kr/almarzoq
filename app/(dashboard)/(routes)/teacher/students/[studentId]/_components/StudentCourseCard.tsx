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
studentId: string
}


export const StudentCourseCard = ({
    id,
    title,
    imageUrl,
    price,
    studentId
}: CourseCardProps)=>{
    
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
        router.refresh()
      }catch(error){
        console.log(error)
        toast.error("something went wrong")
      }finally{
        setIsLoading(false)
      }
    }


    return(
      <ConfirmModal onConfirm={onSubmit}>
            <div className={`group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full cursor-pointer ${
    isLoading ? "opacity-50 cursor-not-allowed" : ""
  }`}>
                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                   <Image
                   fill
                   className="object-cover"
                   alt={title}
                   src={imageUrl || "https://via.placeholder.com/640x360.png?text=No+Image"}
                   />
                </div>
                <div className="flex flex-col pt-2">
                  <div className="text-xs text-muted-foreground">
                    {teacherName}
                  </div>
                  <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
                    {title}
                  </div>
                  {
                    price === 0 ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                            Free
                        </span>
                    ) : (
                        <p className="text-md md:text-sm font-medium text-slate-700">
                            {formatPrice(price)}
                        </p>
                    )
                  }
                </div>
            </div>
          </ConfirmModal>
    )
}
