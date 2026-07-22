import crypto from "crypto";
import { db } from "@/lib/db";
import type { VerificationTokenType } from "@prisma/client";

const TOKEN_BYTES = 32;

const EXPIRY_HOURS: Record<VerificationTokenType, number> = {
  EMAIL_VERIFICATION: 24,
  PASSWORD_RESET: 1,
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Issues a single-use token for the given purpose, invalidating any
 * outstanding tokens of the same type for that user first. Returns the
 * raw token — only its hash is stored, so this is the only place it's
 * ever visible in plaintext.
 */
export async function createVerificationToken(
  userId: string,
  type: VerificationTokenType
) {
  await db.verificationToken.deleteMany({ where: { userId, type } });

  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  await db.verificationToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + EXPIRY_HOURS[type] * 60 * 60 * 1000),
    },
  });

  return rawToken;
}

/** Validates and deletes the token in one step, so it can't be replayed. */
export async function consumeVerificationToken(
  rawToken: string,
  type: VerificationTokenType
): Promise<string | null> {
  const record = await db.verificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.type !== type || record.expiresAt < new Date()) {
    return null;
  }

  await db.verificationToken.delete({ where: { id: record.id } });
  return record.userId;
}
