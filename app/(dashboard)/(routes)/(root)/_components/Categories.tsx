"use client"

import { Category } from "@prisma/client"
import { useState, useTransition } from "react"
import CategoryItem from "./CategoryItem"

interface CategoriesProps {
  items: Category[]
}

export default function Categories({ items }: CategoriesProps) {
  const [isPending, startTransition] = useTransition()
  const [activeValue, setActiveValue] = useState<string | null>(null)

  const onSelect = (value: string | null, navigate: () => void) => {
    if (isPending) return

    setActiveValue(value)

    startTransition(() => {
      navigate()
    })
  }

  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {/* ALL */}
      <CategoryItem
        label="All"
        isPending={isPending}
        isActive={activeValue === null}
        onSelect={onSelect}
      />

      {items.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          value={item.id}
          isPending={isPending}
          isActive={activeValue === item.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
