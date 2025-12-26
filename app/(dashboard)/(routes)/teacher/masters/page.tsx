import { columns } from './_components/Columns'
import { DataTable } from "./_components/DataTable"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { MastersFormClient } from "./_components/MastersFormClient"


const MastersPage = async () => {
    const {userId} = await auth()

    if(!userId) return redirect("/")

    const masters = await db.teacher.findMany()

    return(
    <>
        <div className="max-w-5xl mx-auto flex md:items-center h-full p-6">
            <MastersFormClient />
        </div>
        <div className="p-6 space-y-6">
        <DataTable
            columns={columns}
            data={masters}
        />
        </div>
    </>
    )
}

export default MastersPage