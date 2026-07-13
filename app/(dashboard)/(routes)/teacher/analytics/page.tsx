import { getAnalytics } from "@/actions/getAnalytics"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DataCard from "./_components/DataCard"
import { Chart } from "./_components/Chart"


export default async function AnalyticsPage() {
    const {userId} = await auth()

    if(!userId) {
        return redirect("/")
    }

    const {
        data,
        totalRevenue,
        totalSales
    } = await getAnalytics(userId)

    return(
        <div className="p-6">
            <h1 className="text-2xl md:text-[28px] font-semibold mb-5">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DataCard
                label="Total Sales"
                value={totalSales}
                />
                <DataCard
                label="Total Revenue"
                value={totalRevenue}
                shouldFormat
                />

            </div>
            <Chart
            data={data}
            />
        </div>
    )
}