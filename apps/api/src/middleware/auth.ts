import { createHmac, timingSafeEqual } from "crypto";
import type { Request, Response, NextFunction } from "express";

export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  exp?: number;
  [key: string]: unknown;
}

export interface AuthedRequest extends Request {
  user?: SupabaseJwtPayload;
}

function base64urlDecode(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/**
 * Verifies a Supabase-issued JWT (HS256) using `SUPABASE_JWT_SECRET`.
 *
 * Supabase Auth signs access tokens with the project's JWT secret; this
 * middleware only *verifies* them — it never issues tokens (see the
 * `voltph-security` skill).
 *
 * Dev escape hatch: when `SUPABASE_JWT_SECRET` is not configured and the process
 * is not running in production, requests pass through (so local demos work
 * before clients integrate Supabase Auth). In production a missing secret is a
 * hard 500, and a missing/invalid token is always a 401.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      res
        .status(500)
        .json({ message: "Server authentication is not configured" });
      return;
    }
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  const parts = header.slice("Bearer ".length).trim().split(".");
  if (parts.length !== 3) {
    res.status(401).json({ message: "Malformed token" });
    return;
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const expected = createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest();

  let provided: Buffer;
  try {
    provided = base64urlDecode(signatureB64);
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    res.status(401).json({ message: "Invalid token signature" });
    return;
  }

  let payload: SupabaseJwtPayload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString("utf8"));
  } catch {
    res.status(401).json({ message: "Invalid token payload" });
    return;
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    res.status(401).json({ message: "Token expired" });
    return;
  }

  (req as AuthedRequest).user = payload;
  next();
}
