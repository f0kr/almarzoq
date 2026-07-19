// Seeds the new User table from the Clerk export.
//
// Usage:
//   node scripts/import-users.mjs [path/to/clerk-dashboard-export.csv]
//
// Inputs:
//   - scripts/data/clerk-users.json  (from export-clerk-users.mjs) — required
//   - CSV from Clerk Dashboard "Export all users" — optional; supplies the
//     bcrypt password_digest per user. Without it, password users are created
//     with passwordHash = null and will need a reset.
//
// Existing Clerk user IDs are kept as primary keys, so all Purchase /
// UserProgress / StripeCustomer rows keep working with zero data migration.
// Teacher role is assigned from NEXT_PUBLIC_TEACHER_ID / NEXT_PUBLIC_TEACHER_ID2.
import { readFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const db = new PrismaClient();

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

const usersJsonPath = path.join(process.cwd(), "scripts", "data", "clerk-users.json");
const users = JSON.parse(await readFile(usersJsonPath, "utf8"));

// Optional CSV with password digests.
const hashesById = new Map();
const csvPath = process.argv[2];
if (csvPath) {
  const rows = parseCsv(await readFile(csvPath, "utf8"));
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idIdx = header.indexOf("id");
  const digestIdx = header.indexOf("password_digest");
  const hasherIdx = header.indexOf("password_hasher");
  if (idIdx === -1 || digestIdx === -1) {
    console.error(
      `CSV is missing "id" or "password_digest" columns. Found: ${header.join(", ")}`
    );
    process.exit(1);
  }
  for (const row of rows.slice(1)) {
    const digest = row[digestIdx]?.trim();
    const hasher = hasherIdx === -1 ? "bcrypt" : row[hasherIdx]?.trim();
    if (!digest) continue;
    if (hasher && hasher !== "bcrypt") {
      console.warn(
        `User ${row[idIdx]} uses hasher "${hasher}" (not bcrypt) — skipping hash, they will need a password reset.`
      );
      continue;
    }
    hashesById.set(row[idIdx], digest);
  }
  console.log(`Loaded ${hashesById.size} password hashes from CSV.`);
} else {
  console.warn(
    "No CSV provided — importing without password hashes. Password users will need a reset."
  );
}

const teacherIds = [
  process.env.NEXT_PUBLIC_TEACHER_ID,
  process.env.NEXT_PUBLIC_TEACHER_ID2,
].filter(Boolean);

let imported = 0;
let skipped = 0;
let teachers = 0;
let missingHash = 0;

for (const u of users) {
  if (!u.email) {
    console.warn(`Skipping ${u.id}: no email address`);
    skipped++;
    continue;
  }
  const passwordHash = hashesById.get(u.id) ?? null;
  if (u.hasPassword && !passwordHash) missingHash++;

  const role = teacherIds.includes(u.id) ? "TEACHER" : "STUDENT";
  if (role === "TEACHER") teachers++;

  await db.user.upsert({
    where: { id: u.id },
    create: {
      id: u.id,
      email: u.email.toLowerCase(),
      name: u.name,
      googleId: u.googleId,
      passwordHash,
      role,
      createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
    },
    update: {
      email: u.email.toLowerCase(),
      name: u.name,
      googleId: u.googleId,
      ...(passwordHash ? { passwordHash } : {}),
      role,
    },
  });
  imported++;
}

console.log(`\nImported/updated ${imported} users (${teachers} teachers), skipped ${skipped}.`);
if (missingHash > 0) {
  console.warn(
    `WARNING: ${missingHash} password users have no hash in the CSV — they cannot sign in until given a password.`
  );
}

await db.$disconnect();
