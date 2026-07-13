import { AlertTriangle, CheckCircleIcon, Info } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"


const bannerVariants = cva(
    "border rounded-md px-4 py-3 text-sm font-semibold flex items-center gap-2 w-full",
    {
        variants: {
            variant: {
                warning: "bg-clay/10 border-clay/20 text-clay",
                success: "bg-sage-pale border-sage/30 text-sage",
                info: "bg-paper border-beige text-ink",
            }
        },
        defaultVariants: {
            variant: "warning"
        }
    }
)

interface BannerProps extends VariantProps<typeof bannerVariants> {
    label: string
}

const iconMap = {
    warning: AlertTriangle,
    success: CheckCircleIcon,
    info: Info
}

export const Banner = ({
    label,
    variant
}: BannerProps) => {

    const Icon = iconMap[variant || "warning"]
    return(
        <div className={cn(bannerVariants({ variant }))}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
        </div>
    )
}