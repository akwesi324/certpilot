import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Clears a stale session (its user no longer exists) and returns to the sign-in page. A valid
 * session is left alone, so this link cannot be used to sign someone out.
 */
export async function GET(req: Request) {
  const session = await auth();
  const id = session?.user?.id;
  if (id && (await prisma.user.findUnique({ where: { id }, select: { id: true } }))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  await signOut({ redirectTo: "/login?expired=1" });
}
