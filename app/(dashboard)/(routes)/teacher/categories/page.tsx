import { Button } from "@/components/ui/button"
import Link from "next/link"
import { columns } from "./_components/Columns"
import { DataTable } from "./_components/DataTable"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import CategoryForm from "./_components/CategoryForm"

const CategoriesPage = async () => {

    const {userId} = await auth()

    if(!userId) return redirect("/")

    const categories = await db.category.findMany()

    return(
    <div className="p-6 space-y-6">
        <CategoryForm
        initialData= {{
          name: "",
          iconUrl: ""
        }}
        />
        <DataTable
            columns={columns}
            data={categories}
        />
    </div>
    )
}

export default CategoriesPage