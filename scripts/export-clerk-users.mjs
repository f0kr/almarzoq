// Exports all users from Clerk's Backend API to scripts/data/clerk-users.json.
// Usage: node scripts/export-clerk-users.mjs
// Requires CLERK_SECRET_KEY in .env (still present until cutover cleanup).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.CLERK_SECRET_KEY;
if (!secretKey) {
  console.error("CLERK_SECRET_KEY is not set in .env");
  process.exit(1);
}

const users = [];
const limit = 500;
let offset = 0;

for (;;) {
  const res = await fetch(
    `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=created_at`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  if (!res.ok) {
    console.error(`Clerk API error ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const page = await res.json();
  if (!Array.isArray(page) || page.length === 0) break;

  for (const u of page) {
    const primaryEmail =
      u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
        ?.email_address ?? u.email_addresses?.[0]?.email_address ?? null;
    const google = u.external_accounts?.find(
      (a) => a.provider === "oauth_google"
    );
    users.push({
      id: u.id,
      email: primaryEmail,
      name:
        [u.first_name, u.last_name].filter(Boolean).join(" ") || null,
      googleId: google?.provider_user_id ?? null,
      hasPassword: !!u.password_enabled,
      createdAt: u.created_at,
    });
  }
  offset += page.length;
  console.log(`Fetched ${offset} users…`);
}

const outDir = path.join(process.cwd(), "scripts", "data");
await mkdir(outDir, { recursive: true });
const outFile = path.join(outDir, "clerk-users.json");
await writeFile(outFile, JSON.stringify(users, null, 2));

const withoutEmail = users.filter((u) => !u.email).length;
const googleOnly = users.filter((u) => !u.hasPassword).length;
console.log(`\nWrote ${users.length} users to ${outFile}`);
console.log(`  password users: ${users.length - googleOnly}`);
console.log(`  google-only (no password): ${googleOnly}`);
if (withoutEmail > 0) {
  console.warn(`  WARNING: ${withoutEmail} users have no email address`);
}
