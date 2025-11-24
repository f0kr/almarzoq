
import { DataTable } from "./DataTable"
import { getGroups } from "@/actions/getGroups"
import { columns } from "./Columns"

export default async function Groups({studentId}: {studentId: string}){
    const groups = await getGroups()
    const filteredGroups = groups.filter((group)=> !group.studentIds.includes(studentId))
    
    return(
        <div>
          <DataTable
            columns={columns}
            data={filteredGroups}
          />            
        </div>
    )
}