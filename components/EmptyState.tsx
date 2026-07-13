import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/* Atelier empty state (states card): dashed paper panel, serif heading */
export function EmptyState({ icon = "🎨", title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-lg rounded-2xl border-[1.5px] border-dashed border-beige bg-paper p-10 text-center",
        className
      )}
    >
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3.5 mb-1.5 text-xl font-semibold">{title}</h3>
      {description && <p className="mb-4 text-[13.5px] text-grey">{description}</p>}
      {action}
    </div>
  )
}
