import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM || "onboarding@resend.dev";

/**
 * Must be a publicly reachable absolute URL — a recipient's mail client
 * fetches it from their machine, so a localhost APP_URL renders a broken
 * image. Set EMAIL_LOGO_URL to the production asset when testing locally.
 */
const LOGO_URL =
  process.env.EMAIL_LOGO_URL ||
  (process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/email-logo.png`
    : "");

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

function layout(title: string, bodyHtml: string) {
  // width/height as attributes (not just CSS) so Outlook reserves the right
  // box, and alt text carries the brand when images are blocked — which is
  // the default in plenty of clients.
  const logo = LOGO_URL
    ? `<img src="${LOGO_URL}" alt="Almrzoq Academy" width="64" height="64"
           style="display:block;width:64px;height:64px;border:0;outline:none;text-decoration:none;margin:0 0 20px;" />`
    : "";

  return `
<div style="font-family:-apple-system,Segoe UI,sans-serif;background:#fcfaf7;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#faf5f0;border-radius:16px;padding:32px;border:1px solid #ede8e4;">
    ${logo}
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
