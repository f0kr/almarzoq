
import { getStudents } from "@/actions/getStudents"
import { DataTable } from "./DataTable"
import { columns } from "./Columns"

export default async function Students(){
    const students = await getStudents()
    
    return(
        <div>
          <DataTable
            columns={columns}
            data={students}
          />            
        </div>
    )
}