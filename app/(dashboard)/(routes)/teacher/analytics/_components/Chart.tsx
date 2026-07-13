"use client"

import { Card } from "@/components/ui/card";
import {Bar, BarChart, ResponsiveContainer, XAxis, YAxis} from 'recharts'
interface ChartProps {
    data: {
        name: string;
        total: number;
    }[]
}

export const Chart = ({ data }: ChartProps) => {
    return (
       <Card className="rounded-2xl border-beige p-5">
         <h2 className="font-serif text-lg font-medium">Revenue by course</h2>
         <ResponsiveContainer width='100%' height={350}>
            <BarChart data={data}>
              <defs>
                <linearGradient id="atelierBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--tan)" />
                  <stop offset="100%" stopColor="var(--clay)" />
                </linearGradient>
              </defs>
              <XAxis
              dataKey="name"
              stroke="var(--grey)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              />
              <YAxis
              stroke="var(--grey)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              />
              <Bar
              dataKey="total"
              fill="url(#atelierBar)"
              radius={[8, 8, 0, 0]}
              />
            </BarChart>
         </ResponsiveContainer>
       </Card>
    )
}