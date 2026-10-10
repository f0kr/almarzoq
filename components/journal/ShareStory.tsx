"use client"

import { Loader2, Share2 } from "lucide-react"
import { useRef, useState } from "react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"

interface ShareStoryProps {
  title: string
  /** Pre-versioned so a republished article mints a fresh card. */
  storyUrl: string
}

/** Clipboard fallback for origins where navigator.clipboard is unavailable. */
function legacyCopy(text: string) {
  const area = document.createElement("textarea")
  area.value = text
  area.setAttribute("readonly", "")
  area.style.position = "fixed"
  area.style.top = "0"
  area.style.opacity = "0"
  document.body.appendChild(area)
  area.select()
  const copied = document.execCommand("copy")
  document.body.removeChild(area)
  if (!copied) throw new Error("copy rejected")
}

/**
 * Share the article as a 1080x1920 story card.
 *
 * No web API posts into someone's Instagram or TikTok story — the deep links
 * that do are native-SDK only. What a web page can do is hand the image to the
 * OS share sheet, where those apps appear as targets.
 *
 * The whole design here is about *transient user activation*: navigator.share
 * only works for a few seconds after the tap that triggered it, and anything
 * slow or activation-consuming in between kills it. So the card is prefetched
 * on pointer-down, and the clipboard write happens only after the sheet has
 * opened — a clipboard write beforehand consumes the activation outright.
 */
export function ShareStory({ title, storyUrl }: ShareStoryProps) {
  const [busy, setBusy] = useState(false)
  /** Shared across attempts: a retry reuses the resolved blob instead of refetching. */
  const card = useRef<Promise<Blob> | null>(null)

  const pageUrl = () => (typeof window === "undefined" ? "" : window.location.href)

  const fetchCard = () => {
    card.current ??= fetch(storyUrl).then((response) => {
      if (!response.ok) throw new Error(`card render failed: ${response.status}`)
      return response.blob()
    })
    return card.current
  }

  // Pointer-down fires before click, so the request is already in flight by the
  // time the handler runs. Costs nothing for readers who never tap.
  const prefetch = () => {
    try {
      void fetchCard().catch(() => {
        // A failure here is reported by the click handler; don't surface twice.
      })
    } catch {
      // ignore
    }
  }

  const copyLink = async () => {
    try {
      const url = pageUrl()
      // navigator.clipboard exists only in a secure context (https, or
      // localhost), and is missing from some in-app browsers.
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url)
      else legacyCopy(url)
      return true
    } catch {
      return false
    }
  }

  const share = async () => {
    setBusy(true)
    try {
      const blob = await fetchCard()
      const file = new File([blob], "almrzoq-story.png", { type: "image/png" })

      // canShare must be asked about the actual file: iOS Safari reports
      // navigator.share while refusing image payloads in some versions.
      if (navigator.canShare?.({ files: [file] })) {
        // No `url` key: some targets see one and share the link alone, dropping
        // the image. The link rides in `text` instead, which story composers
        // ignore and chat apps keep.
        await navigator.share({ files: [file], title, text: `${title}\n${pageUrl()}` })
        // Only now — before the sheet opens this would spend the activation
        // that navigator.share needs. Best effort; the share already succeeded.
        const copied = await copyLink()
        toast.success(
          copied
            ? "Shared. Link copied — paste it into a link sticker."
            : "Shared."
        )
        return
      }

      if (navigator.share) {
        await navigator.share({ title, text: title, url: pageUrl() })
        return
      }

      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = "almrzoq-story.png"
      link.click()
      URL.revokeObjectURL(objectUrl)

      const copied = await copyLink()
      toast.success(
        window.isSecureContext
          ? copied
            ? "Image downloaded and link copied — add it to your story."
            : "Image downloaded — add it to your story."
          : "Direct sharing needs a secure connection (HTTPS). Downloaded the image instead."
      )
    } catch (error) {
      // Dismissing the share sheet throws AbortError. Not a failure.
      if (error instanceof DOMException && error.name === "AbortError") return

      // NotAllowedError means the activation window closed before the sheet
      // opened. Saying "try again" is honest here — the retry reuses the
      // already-fetched card, so it will be instant.
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error("Sharing timed out — tap share again, it will be instant now.")
        console.log("[share] lost user activation", error)
        return
      }

      console.log("[share]", error)
      toast.error(
        error instanceof Error && error.message.startsWith("card render failed")
          ? "Couldn't build the story card. Try again."
          : "Couldn't share. Try again."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      variant="soft"
      onPointerDown={prefetch}
      onFocus={prefetch}
      onClick={share}
      disabled={busy}
    >
      {busy ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <Share2 className="mr-1.5 h-4 w-4" />
      )}
      Share as story
    </Button>
  )
}
