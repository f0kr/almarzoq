/**
 * Language signals for mixed Arabic/English content.
 *
 * The catalog is bilingual: course titles carry both scripts
 * ("Statues drawing-كورس رسم التماثيل"), descriptions are Arabic, and the UI
 * chrome plus master bios are English. A single document-level `lang` would
 * mislabel one side or the other, so Arabic-bearing text is tagged where it
 * renders instead.
 *
 * These helpers only ever set `lang`, never `dir` — `lang` has no layout
 * effect, while `dir` would mirror the layout and this codebase still uses
 * physical spacing utilities throughout.
 */

// Arabic, Arabic Supplement, Extended-A, and Presentation Forms.
const ARABIC_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function hasArabic(text?: string | null): boolean {
  return Boolean(text && ARABIC_SCRIPT.test(text));
}

/**
 * BCP 47 tag for a string. Returns "ar" when any Arabic script is present —
 * bilingual titles are tagged "ar" because the Arabic half is the part a
 * client would otherwise mis-segment; the Latin half needs no help.
 */
export function detectLang(text?: string | null): "ar" | "en" {
  return hasArabic(text) ? "ar" : "en";
}

/**
 * Spread onto a JSX element wrapping user-generated text:
 *   <h3 {...langAttrs(course.title)}>{course.title}</h3>
 */
export function langAttrs(text?: string | null): { lang: "ar" | "en" } {
  return { lang: detectLang(text) };
}
