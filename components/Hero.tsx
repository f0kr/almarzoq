import Link from "next/link"
import { Button } from "./ui/button"

interface HeroProps {
  stats?: { value: string; label: string }[]
}

/* Atelier hero (hero card): eyebrow chip, serif headline with italic clay
   accents, lede, pill CTAs and serif stats. */
export function Hero({ stats }: HeroProps) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10 md:py-14 text-center md:text-left">
      <span className="inline-block rounded-full bg-clay-tint px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-clay mb-5">
        Almrzoq Academy
      </span>
      <h1 className="font-serif font-semibold text-4xl md:text-5xl leading-[1.05] mb-4">
        Master the <em className="italic text-primary">Art</em> of Drawing,
        with real <em className="italic text-primary">masters</em>.
      </h1>
      <p className="mx-auto md:mx-0 max-w-md text-base md:text-[17px] leading-normal text-grey mb-7">
        Structured courses in drawing, painting and digital art — taught by
        working professionals. Learn at your pace, build a portfolio you are
        proud of.
      </p>
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5">
        <Button size="lg" asChild>
          <Link href="#courses">Find Your Course &rarr;</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/masters">Meet the masters</Link>
        </Button>
      </div>
      {stats && stats.length > 0 && (
        <div className="mt-9 flex justify-center md:justify-start gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-serif font-semibold text-2xl md:text-[28px]">{s.value}</div>
              <div className="text-xs text-grey">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
