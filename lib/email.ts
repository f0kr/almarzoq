import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM || "onboarding@resend.dev";

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/**
 * Never throws — a transport failure (bad API key, unverified domain,
 * Resend outage) shouldn't turn an otherwise-successful signup, password
 * reset, or resend request into a 500. It's logged instead; the affected
 * user can always ask for the email again from the sign-in screen.
 */
async function send(to: string, subject: string, html: string) {
  const client = getClient();
  if (!client) {
    // No provider configured yet — don't block the auth flow, just log
    // so the link is still usable in development.
    console.warn(
      `[EMAIL] RESEND_API_KEY not set; email not sent.\nto=${to} subject="${subject}"\n${html}`
    );
    return;
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    if (error) console.error("[EMAIL] Resend error", error);
  } catch (error) {
    console.error("[EMAIL] Resend request failed", error);
  }
}

function layout(title: string, bodyHtml: string, dir: "ltr" | "rtl" = "ltr") {
  return `
<div dir="${dir}" style="font-family:-apple-system,Segoe UI,sans-serif;background:#fcfaf7;padding:32px 16px;text-align:${dir === "rtl" ? "right" : "left"};">
  <div style="max-width:480px;margin:0 auto;background:#faf5f0;border-radius:16px;padding:32px;border:1px solid #ede8e4;">
    <h1 style="font-size:20px;color:#272727;margin:0 0 16px;">${title}</h1>
    ${bodyHtml}
    <p style="margin-top:32px;font-size:12px;color:#4a4a4c;">Almrzoq Academy</p>
  </div>
</div>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;background:#9c6349;color:#faf5f0;padding:10px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">${label}</a>`;
}

export async function sendVerificationEmail(
  to: string,
  name: string | null,
  link: string
) {
  const html = layout(
    "Confirm your email",
    `<p style="color:#4a4a4c;font-size:14px;line-height:1.6;">Hi ${
      name ?? "there"
    }, welcome to Almrzoq Academy. Confirm your email address to activate your account.</p>
     ${button(link, "Confirm email")}
     <p style="margin-top:20px;font-size:12px;color:#4a4a4c;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>`
  );
  await send(to, "Confirm your email — Almrzoq Academy", html);
}

export async function sendPasswordResetEmail(
  to: string,
  name: string | null,
  link: string
) {
  const html = layout(
    "Reset your password",
    `<p style="color:#4a4a4c;font-size:14px;line-height:1.6;">Hi ${
      name ?? "there"
    }, we received a request to reset your password.</p>
     ${button(link, "Reset password")}
     <p style="margin-top:20px;font-size:12px;color:#4a4a4c;">This link expires in 1 hour. If you didn't request this, you can ignore this email — your password won't change.</p>`
  );
  await send(to, "Reset your password — Almrzoq Academy", html);
}

// --- Journal -------------------------------------------------------------
// Authors write in Arabic, so the notices they get back are Arabic too.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.almrzoq.academy";

const arabicDate = new Intl.DateTimeFormat("ar", {
  dateStyle: "long",
  timeStyle: "short",
});

/** Sent when an admin returns an article for changes. */
export async function sendArticleChangesRequestedEmail(opts: {
  to: string;
  articleTitle: string;
  articleId: string;
  reasons: string[];
  note?: string | null;
}) {
  const reasonList = opts.reasons.length
    ? `<ul style="color:#4a4a4c;font-size:14px;line-height:2;padding-inline-start:20px;">${opts.reasons
        .map((reason) => `<li>${reason}</li>`)
        .join("")}</ul>`
    : "";

  const note = opts.note
    ? `<p style="color:#272727;font-size:14px;line-height:1.9;white-space:pre-line;">${opts.note}</p>`
    : "";

  await send(
    opts.to,
    "مقالك يحتاج إلى بعض التعديلات",
    layout(
      "مقالك يحتاج إلى بعض التعديلات",
      `<p style="color:#4a4a4c;font-size:14px;line-height:1.9;">راجع فريق التحرير مقالك «${opts.articleTitle}» وطلب التعديلات الآتية قبل نشره:</p>
       ${reasonList}
       ${note}
       ${button(`${APP_URL}/journal/submit/${opts.articleId}`, "تعديل المقال")}`,
      "rtl"
    )
  );
}

/** Sent when an article is approved — immediately, or for a future date. */
export async function sendArticleApprovedEmail(opts: {
  to: string;
  articleTitle: string;
  slug: string;
  publishesAt: Date;
  scheduled: boolean;
}) {
  const title = opts.scheduled ? "تمت الموافقة على مقالك" : "تم نشر مقالك";
  const body = opts.scheduled
    ? `<p style="color:#4a4a4c;font-size:14px;line-height:1.9;">تمت الموافقة على مقالك «${opts.articleTitle}»، وسيُنشر تلقائياً بتاريخ ${arabicDate.format(opts.publishesAt)}.</p>`
    : `<p style="color:#4a4a4c;font-size:14px;line-height:1.9;">تم نشر مقالك «${opts.articleTitle}» في مجلة الأكاديمية. شكراً لمساهمتك.</p>`;

  await send(
    opts.to,
    title,
    layout(
      title,
      `${body}${opts.scheduled ? "" : button(`${APP_URL}/journal/${opts.slug}`, "عرض المقال")}`,
      "rtl"
    )
  );
}

/** Sent by the cron when a scheduled article actually goes live. */
export async function sendArticlePublishedEmail(opts: {
  to: string;
  articleTitle: string;
  slug: string;
}) {
  await send(
    opts.to,
    "مقالك منشور الآن",
    layout(
      "مقالك منشور الآن",
      `<p style="color:#4a4a4c;font-size:14px;line-height:1.9;">مقالك «${opts.articleTitle}» أصبح متاحاً للقرّاء في مجلة الأكاديمية.</p>
       ${button(`${APP_URL}/journal/${opts.slug}`, "عرض المقال")}`,
      "rtl"
    )
  );
}
