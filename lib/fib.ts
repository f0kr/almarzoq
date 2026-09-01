/**
 * FIB Card Payment Gateway (server-to-server, redirect-based 3-D Secure).
 *
 * Three endpoints, and an unusual handshake: the bearer token is minted per
 * `orderId` and is single-use, so we mint once before `initiate` and AGAIN
 * before `status`. Every request additionally carries an `X-HMAC` signature.
 *
 * Nothing in here may ever reach a browser or the Expo bundle — the shared
 * secret signs every request. Server-only.
 */
import crypto from "crypto";

export type FibClientInfo = {
  clientName: string;
  mobilePhone: string;
  addressLine1: string;
  addressLine2: string;
  email: string;
};

/** `paymentData.status` as returned by Check Payment Status. */
export type FibTransactionStatus = "SUCCESS" | "ERROR";

export type FibStatusResponse = {
  paymentData: {
    reference?: string;
    terminalNumber: string;
    returnCode?: string;
    amount: string;
    orderId: string;
    authorizationCode?: string;
    paymentId: string;
    currency: string;
    paymentDate: string;
    status: FibTransactionStatus;
  };
  errorCode: string;
  description: string;
  clientInfo?: FibClientInfo;
};

export class FibError extends Error {
  code: string;
  httpStatus: number;
  constructor(message: string, code: string, httpStatus: number) {
    super(message);
    this.name = "FibError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

// ---- Configuration -------------------------------------------------------

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function fibConfig() {
  return {
    baseUrl: (
      process.env.FIB_CARD_BASE_URL ?? "https://uatswitch.fib.iq/ACS24"
    ).replace(/\/+$/, ""),
    terminalNumber: required("FIB_CARD_TERMINAL_NUMBER"),
    institution: required("FIB_CARD_INSTITUTION"),
    merchantId: required("FIB_CARD_MERCHANT_ID"),
    acquirer: required("FIB_CARD_ACQUIRER"),
    secret: required("FIB_CARD_HMAC_SECRET"),
  };
}

/** True when the gateway is configured; lets callers hide the card CTA. */
export function isFibConfigured(): boolean {
  try {
    fibConfig();
    return true;
  } catch {
    return false;
  }
}

// ---- Request signing -----------------------------------------------------

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/**
 * Recursive, case-insensitive alphabetical key sort — the canonical form FIB
 * signs. Arrays are left in order (only their object members are sorted).
 * Mirrors the reference implementation in FIB's Postman collection.
 */
export function canonicalize(value: Json): Json {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value !== "object" || value === null) return value;

  const ordered: { [k: string]: Json } = {};
  for (const key of Object.keys(value).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase(), "en")
  )) {
    ordered[key] = canonicalize(value[key]);
  }
  return ordered;
}

/**
 * HMAC-SHA512 (hex) of the canonical JSON body.
 *
 * We also SEND the canonical form, so the bytes we sign are exactly the bytes
 * we transmit — FIB re-canonicalizes server-side either way, but this removes
 * a whole class of "invalid hmac signature" bugs.
 */
export function signBody(body: Json, secret: string) {
  const payload = JSON.stringify(canonicalize(body));
  const hmac = crypto
    .createHmac("sha512", secret)
    .update(payload, "utf8")
    .digest("hex");
  return { payload, hmac };
}

/** Constant-time compare for verifying inbound callback signatures. */
export function verifySignature(raw: string, signature: string, secret: string) {
  const expected = crypto
    .createHmac("sha512", secret)
    .update(raw, "utf8")
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.trim().toLowerCase(), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---- Helpers -------------------------------------------------------------

/**
 * `DD/MM/YYYY HH:mm:ss` in Baghdad time. FIB rejects stale timestamps with
 * `400 Invalid Date`, so this must be generated at call time — never cached.
 */
export function fibDateTime(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Baghdad",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get(
    "minute"
  )}:${get("second")}`;
}

/**
 * A fresh numeric order id. FIB rejects reuse with `403 Order id already
 * processed`, so this is generated once per checkout attempt and stored.
 */
export function newOrderId(): string {
  // 18 digits, matching the shape FIB's own samples use.
  const high = crypto.randomInt(1, 1_000_000_000);
  const low = crypto.randomInt(0, 1_000_000_000);
  return `${high}${String(low).padStart(9, "0")}`;
}

// ---- Transport -----------------------------------------------------------

async function fibPost<T>(
  path: string,
  body: Json,
  accessToken?: string
): Promise<T> {
  const { baseUrl, secret } = fibConfig();
  const { payload, hmac } = signBody(body, secret);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-HMAC": hmac,
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers,
      body: payload,
      cache: "no-store",
    });
  } catch (error) {
    throw new FibError(
      `Could not reach the FIB gateway at ${baseUrl}${path}`,
      "NETWORK",
      0
    );
  }

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON error page */
  }

  if (!res.ok) {
    const err = json as { errorCode?: string; description?: string } | null;
    throw new FibError(
      err?.description || `FIB request failed (${res.status})`,
      err?.errorCode || String(res.status),
      res.status
    );
  }

  return json as T;
}

// ---- Endpoints -----------------------------------------------------------

/**
 * Mint an access token. Single-use and bound to `orderId` — call this
 * immediately before each authenticated request, never cache it.
 */
export async function mintToken(orderId: string): Promise<string> {
  const { terminalNumber, institution, merchantId, acquirer } = fibConfig();

  const res = await fibPost<{ accessToken: string; expiresIn: number }>(
    "/api/v1/auth/token",
    {
      terminalNumber,
      institution,
      merchantId,
      acquirer,
      dateTime: fibDateTime(),
      orderId,
    }
  );

  if (!res?.accessToken) {
    throw new FibError("FIB returned no access token", "NO_TOKEN", 502);
  }
  return res.accessToken;
}

export async function initiatePayment(input: {
  orderId: string;
  /** Whole IQD — no minor units, no decimals. */
  amount: number;
  currency?: string;
  redirectUrl: string;
  callbackUrl: string;
  clientInfo: FibClientInfo;
}): Promise<{ redirectUrl: string; paymentId: string }> {
  const token = await mintToken(input.orderId);

  const res = await fibPost<{ redirectUrl: string; paymentId: string }>(
    "/api/v1/payment/initiate",
    {
      clientInfo: { ...input.clientInfo },
      amount: String(Math.round(input.amount)),
      currency: input.currency ?? "IQD",
      redirectUrl: input.redirectUrl,
      callbackUrl: input.callbackUrl,
      orderId: input.orderId,
    },
    token
  );

  if (!res?.redirectUrl || !res?.paymentId) {
    throw new FibError("FIB returned an incomplete initiate response", "BAD_INITIATE", 502);
  }
  return res;
}

/**
 * The source of truth for a payment's outcome. Never grant access off the
 * callback or the browser redirect alone — always confirm here.
 *
 * Returns null when FIB has no transaction yet (404), which is normal while
 * the customer is still on the 3-D Secure page.
 */
export async function checkPaymentStatus(input: {
  orderId: string;
  paymentId: string;
}): Promise<FibStatusResponse | null> {
  const token = await mintToken(input.orderId);

  try {
    return await fibPost<FibStatusResponse>(
      "/api/v1/payments/status",
      { paymentId: input.paymentId, orderId: input.orderId },
      token
    );
  } catch (error) {
    if (error instanceof FibError && error.httpStatus === 404) return null;
    throw error;
  }
}
