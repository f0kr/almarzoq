import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * The journal sits outside the dashboard chrome — like the course landing
 * page — so it carries its own header.
 */
export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-symbol.png"
              alt="Almrzoq Academy"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-serif text-sm font-semibold text-foreground">
              Al<span className="text-clay">mrzoq</span> Journal
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Academy
              </Link>
            </Button>
            <Button asChild variant="soft" size="sm">
              <Link href="/journal/submit">
                <PenLine className="mr-1.5 h-4 w-4" />
                Write
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}
