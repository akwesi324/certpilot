import { prisma } from "@/lib/prisma";

/** Admins are listed by email in ADMIN_EMAILS (comma separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return Boolean(user && adminEmails().includes(user.email.toLowerCase()));
}
