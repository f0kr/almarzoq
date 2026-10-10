/**
 * The publishing declaration every writer must accept before an article can be
 * submitted. Arabic, because the writers are.
 *
 * Versioned: `Article.termsVersion` records which text a given author agreed
 * to, so changing the wording never rewrites what somebody already signed.
 * Bump TERMS_VERSION on any wording change — never edit a clause in place.
 *
 * This is drafted to be clear and specific, not to be legal advice. Have a
 * lawyer in your jurisdiction review it before launch.
 */

export const TERMS_VERSION = "2026-10-07"

export const TERMS_TITLE = "إقرار النشر وشروط المسؤولية"

export const TERMS_INTRO =
  "قبل إرسال المقال للمراجعة، يُرجى قراءة البنود الآتية بعناية. إرسالك للمقال يعني موافقتك الكاملة عليها:"

export type TermsClause = { id: string; text: string }

export const TERMS_CLAUSES: TermsClause[] = [
  {
    id: "originality",
    text: "أُقرّ بأن هذا المقال من تأليفي الشخصي، وأنه لم يُنسخ — كلياً أو جزئياً — من أي مصدر آخر، وأن كل اقتباس وارد فيه منسوب صراحةً إلى مصدره وموثَّق داخل المقال.",
  },
  {
    id: "ai-disclosure",
    text: "أُقرّ بأن المقال ليس مُولَّداً بالكامل بواسطة أدوات الذكاء الاصطناعي، وأنني راجعت مضمونه وتحققت من صحة المعلومات الواردة فيه.",
  },
  {
    id: "images",
    text: "أُقرّ بأن جميع الصور والرسومات والمواد المرئية المرفقة هي من إنتاجي الخاص، أو مرخّصة لي ترخيصاً يسمح بالنشر، أو متاحة ضمن الملكية العامة أو برخصة مفتوحة تجيز إعادة النشر، وأنني أوردتُ الإسناد المطلوب حيثما تشترطه الرخصة.",
  },
  {
    id: "third-party",
    text: "أُقرّ بأن المقال لا ينتهك حقوق الملكية الفكرية أو العلامات التجارية أو حقوق الخصوصية لأي طرف ثالث، ولا يتضمن مادة تشهيرية أو مسيئة أو مخالفة للقوانين النافذة.",
  },
  {
    id: "liability",
    text: "أتحمّل وحدي المسؤولية القانونية الكاملة عن محتوى المقال وعن المواد المرفقة به، وألتزم بتعويض أكاديمية المرزوق عن أي ضرر أو مطالبة أو نفقات قانونية تنشأ عن إخلالي بهذه الإقرارات.",
  },
  {
    id: "license",
    text: "أمنح أكاديمية المرزوق ترخيصاً غير حصري وغير محدد المدة ودون مقابل مالي، لنشر المقال على موقعها وتطبيقها وقنواتها التعريفية، مع احتفاظي الكامل بحقوق الملكية الفكرية للمقال بصفتي مؤلفه.",
  },
  {
    id: "editorial",
    text: "أوافق على حق الأكاديمية في مراجعة المقال وإجراء تعديلات تحريرية شكلية لا تمسّ جوهر المحتوى، وفي تأجيل نشره أو رفضه أو إزالته بعد النشر إذا تبيّن إخلاله بأي من هذه الشروط.",
  },
]

export const TERMS_CONFIRMATION =
  "قرأتُ البنود أعلاه وأوافق عليها، وأُقرّ بأن ما ورد فيها صحيح."
