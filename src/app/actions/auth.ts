"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clientIp, lockedUntil, recordFailure } from "@/lib/throttle";
import { passwordField } from "@/lib/validation";

export type FormState = { error?: string; ok?: number } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: passwordField,
});

const MAX_SIGNUPS_PER_IP = 10; // per hour
const HOUR = 60 * 60 * 1000;

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ipKey = `register:${clientIp(await headers())}`;
  if (await lockedUntil(ipKey)) return { error: "Too many sign-ups from this network. Try again later." };

  const { name, email, password } = parsed.data;
  if (await prisma.user.findUnique({ where: { email } })) return { error: "An account with that email already exists" };

  await prisma.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
  await recordFailure(ipKey, MAX_SIGNUPS_PER_IP, HOUR); // counts sign-ups, not failures

  // New users pick the exam they are preparing for first.
  await signIn("credentials", { email, password, redirectTo: "/setup" });
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "rate_limited") {
      return { error: "Too many failed sign-in attempts. Wait 15 minutes and try again." };
    }
    if (error instanceof AuthError) return { error: "Invalid email or password" };
    throw error; // lets the redirect through
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
