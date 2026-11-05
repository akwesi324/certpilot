import { prisma } from "@/lib/prisma";

/**
 * Brute-force protection for sign-in and sign-up, stored in the database (AuthThrottle) so it
 * works across serverless instances. A key that reaches `max` failures inside the window is
 * locked until the window has passed.
 */
const WINDOW_MS = 15 * 60 * 1000;

export async function lockedUntil(key: string): Promise<Date | null> {
  const row = await prisma.authThrottle.findUnique({ where: { key } });
  return row?.lockedUntil && row.lockedUntil > new Date() ? row.lockedUntil : null;
}

export async function recordFailure(key: string, max: number, windowMs = WINDOW_MS): Promise<void> {
  const now = new Date();
  const row = await prisma.authThrottle.findUnique({ where: { key } });
  const fresh = !row || now.getTime() - row.windowStart.getTime() > windowMs;
  const failures = fresh ? 1 : row.failures + 1;
  const data = {
    failures,
    windowStart: fresh ? now : row.windowStart,
    lockedUntil: failures >= max ? new Date(now.getTime() + windowMs) : null,
  };
  await prisma.authThrottle.upsert({ where: { key }, create: { key, ...data }, update: data });
}

export async function clearFailures(key: string): Promise<void> {
  await prisma.authThrottle.deleteMany({ where: { key } });
}

/** Client IP from the proxy headers (Vercel and most hosts set x-forwarded-for). */
export function clientIp(headers: Headers | null | undefined): string {
  const fwd = headers?.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : headers?.get("x-real-ip") || "unknown").trim().slice(0, 64);
}
