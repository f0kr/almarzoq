
import { DataTable } from "./DataTable"
import { getGroups } from "@/actions/getGroups"
import { columns } from "./Columns"

export default async function Groups({studentId, courseId}: {studentId: string, courseId: string}){
    const groups = await getGroups(courseId)
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