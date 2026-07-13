import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/format"
import { CourseProgress } from "./CourseProgress"

interface CourseCardProps {
id: string
title: string
imageUrl: string
chaptersLength: number
price: number
progress: number | null
category: string
masters: { name: string; profileUrl?: string | null }[]
}


export const CourseCard = ({
    id,
    title,
    imageUrl,
    chaptersLength,
    price,
    progress,
    category,
    masters
}: CourseCardProps)=>{
    const masterLabel = masters.length ? masters.map((m) => m.name).join(", ") : "Unknown master"
    return(
        <Link href={`/courses/${id}`}>
            <div className="group h-full bg-card border border-border rounded-2xl p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(39,39,39,0.10)]">
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden">
                   <span className="absolute z-10 top-2.5 left-2.5 bg-background/90 backdrop-blur-sm text-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full">
                     {category ? category : "Uncategorized"}
                   </span>
                   <Image
                   fill
                   className="object-cover"
                   alt={title}
                   src={imageUrl}
                   />
                </div>
                <div className="flex flex-col pt-3 px-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                    {masters.length > 0 && (
                      <div className="flex -space-x-2 shrink-0">
                        {masters.map((m, i) =>
                          m.profileUrl ? (
                            <span key={i} className="relative w-5 h-5 rounded-full overflow-hidden ring-2 ring-card">
                              <Image
                                src={m.profileUrl}
                                alt={m.name}
                                fill
                                sizes="20px"
                                className="object-cover"
                                unoptimized
                              />
                            </span>
                          ) : (
                            <span key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-clay to-tan ring-2 ring-card" />
                          )
                        )}
                      </div>
                    )}
                    <span className="line-clamp-1">{masterLabel}</span>
                  </div>
                  <h3 className="font-serif font-semibold text-lg leading-tight line-clamp-2 mb-2.5 transition-colors group-hover:text-primary">
                    {title}
                  </h3>
                  {progress !== null ? (
                    <CourseProgress
                      variant={progress === 100 ? "success" : "default"}
                      size="sm"
                      value={progress}
                    />
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground mb-3.5">
                        {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
                      </p>
                      <div className="flex items-center justify-between">
                        {price === 0 ? (
                          <span className="bg-sage text-sage-pale text-xs font-semibold px-3 py-1.5 rounded-full">
                            Free
                          </span>
                        ) : (
                          <span className="font-semibold text-base text-foreground">
                            {formatPrice(price)}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-primary">
                          {price === 0 ? "Start now" : "View course"} &rarr;
                        </span>
                      </div>
                    </>
                  )}
                </div>
            </div>
        </Link>
    )
}
