import { db } from "@/lib/db"

export async function getGroups() {

  const groups = await db.groupUrl.findMany()

  return groups
}
