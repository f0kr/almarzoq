import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

interface DataCardProps {
value: number;
label: string;
shouldFormat?: boolean;
}

export default function DataCard({ value, label, shouldFormat }: DataCardProps){
return (
    <Card className="rounded-2xl border-beige gap-1.5 py-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-[12.5px] font-medium text-grey">
               {label}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="font-serif text-3xl font-semibold">
                {shouldFormat ? formatPrice(value) : value}
            </div>
        </CardContent>
    </Card>
)
}