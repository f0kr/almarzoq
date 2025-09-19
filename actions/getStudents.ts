import { isTeacher } from "@/lib/teacher"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function getStudents() {

    const {userId} = await auth()
    
        
     if(!isTeacher(userId)) return redirect("/")

        const users = (await clerkClient()).users.getUserList()
    
        const students = (await users).data.map((user) => ({
           id: user.id,
           fullName: user.fullName,
           email: user.emailAddresses[0]?.emailAddress ?? "",
           createdAt: user.createdAt,
  }))


        return students

}