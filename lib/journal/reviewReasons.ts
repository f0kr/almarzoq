/**
 * The fixed reasons an admin can attach when sending an article back. Codes are
 * stored in `ArticleReview.reasons`; the Arabic label is what the author reads,
 * the English one is what the admin picks from in the dashboard.
 */

export type ReviewReason = { code: string; en: string; ar: string }

export const REVIEW_REASONS: ReviewReason[] = [
  { code: "sources", en: "Sources missing or unclear", ar: "المصادر ناقصة أو غير واضحة" },
  { code: "image-rights", en: "Image rights unclear", ar: "حقوق الصور غير موثّقة" },
  { code: "language", en: "Language needs editing", ar: "اللغة تحتاج إلى تحرير ومراجعة" },
  { code: "structure", en: "Structure needs work", ar: "بنية المقال تحتاج إلى إعادة ترتيب" },
  { code: "off-topic", en: "Off-topic for the journal", ar: "الموضوع خارج نطاق مجلة الأكاديمية" },
  { code: "too-short", en: "Too short", ar: "المقال قصير جداً" },
  { code: "category", en: "Wrong category", ar: "التصنيف غير مناسب" },
  { code: "duplicate", en: "Already published elsewhere", ar: "المقال منشور في مكان آخر" },
]

export const REVIEW_REASON_BY_CODE = new Map(REVIEW_REASONS.map((r) => [r.code, r]))
