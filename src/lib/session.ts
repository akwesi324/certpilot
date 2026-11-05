import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * The signed-in user's id, checked against the database. A session can outlive its user (the
 * account was deleted, or the database was recreated), and the signed JWT alone cannot tell;
 * such a stale session is sent to /api/session/reset, which clears it and returns to /login,
 * instead of every page crashing on a missing user.
 */
async function currentUserId(): Promise<{ id: string | null; stale: boolean }> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return { id: null, stale: false };
  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  return exists ? { id, stale: false } : { id: null, stale: true };
}

/** Use in server components and actions. Redirects to /login if signed out or stale. */
export async function requireUserId(): Promise<string> {
  const { id, stale } = await currentUserId();
  if (stale) redirect("/api/session/reset");
  if (!id) redirect("/login");
  return id;
}

/** Use in API routes (/api/*). Returns null if unauthorized instead of redirecting. */
export async function getApiUserId(): Promise<string | null> {
  return (await currentUserId()).id;
}

/** Get full session in API routes */
export async function getApiSession() {
  return await auth();
}
