import { IconBadge } from "@/components/IconBadge"
import { LucideIcon } from "lucide-react";


interface InforCardProps {
    numberOfItems : number;
    variant?: "default" | "success";
    label: string;
    icon: LucideIcon
}

export const InfoCard = ({
    variant,
    icon: Icon,
    numberOfItems,
    label,
}: InforCardProps) => {
    return (
        <div className="bg-card border border-beige rounded-2xl flex items-center gap-x-3.5 p-4">
          <IconBadge
          variant={variant}
          icon={Icon}
          />
          <div>
            <p className="text-[13px] text-grey">
                {label}
            </p>
            <p className="font-serif font-semibold text-xl">
                {numberOfItems} {numberOfItems === 1 ? "Course" : "Courses"}
            </p>
          </div>
        </div>
    )
}