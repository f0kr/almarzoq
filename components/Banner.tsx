import { AlertTriangle, CheckCircleIcon, Info } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"


const bannerVariants = cva(
    "border px-4 py-3 text-sm font-semibold flex items-center gap-2 w-full",
    {
        variants: {
            variant: {
                /* Atelier reversed (banners card): solid fills, pale text */
                warning: "bg-clay border-clay text-clay-tint",
                success: "bg-sage border-sage text-sage-pale",
                info: "bg-ink border-ink text-paper",
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