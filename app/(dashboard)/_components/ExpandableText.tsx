import React from "react"

export default function ExpandableText({
  text,
  previewLength,
}: {
  text: string
  previewLength?: number
}) {
  const [expanded, setExpanded] = React.useState(false)

  const isLong = text.length > previewLength!
  const displayText = expanded || !isLong
    ? text
    : text.slice(0, previewLength) + "..."

  return (
    <div className="space-y-2">
      <p className="text-s md:text-s text-foreground  font-semibold leading-relaxed transition-all duration-300">
        {displayText}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  )
}
