"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  TERMS_CLAUSES,
  TERMS_CONFIRMATION,
  TERMS_INTRO,
  TERMS_TITLE,
} from "@/lib/journal/terms"

interface ArticleTermsProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * The publishing declaration. Rendered RTL and in full — the writer has to be
 * able to read what they're agreeing to, so it is never behind a link or a
 * "read more".
 */
export function ArticleTerms({ checked, onCheckedChange, disabled }: ArticleTermsProps) {
  return (
    <section
      dir="rtl"
      lang="ar"
      className="rounded-2xl border border-clay/40 bg-clay-tint/50 p-5"
    >
      <h2 className="font-serif text-lg font-semibold text-foreground">{TERMS_TITLE}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{TERMS_INTRO}</p>

      <ol className="mt-4 space-y-3">
        {TERMS_CLAUSES.map((clause, index) => (
          <li key={clause.id} className="flex gap-3 text-sm leading-7 text-foreground">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-clay text-xs font-bold text-paper">
              {index + 1}
            </span>
            <span>{clause.text}</span>
          </li>
        ))}
      </ol>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-clay/40 bg-card p-3">
        <Checkbox
          checked={checked}
          disabled={disabled}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className="mt-0.5"
        />
        <span className="text-sm font-semibold text-foreground">{TERMS_CONFIRMATION}</span>
      </label>
    </section>
  )
}
