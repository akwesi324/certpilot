"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { EXAMS } from "@/lib/exams";
import { EngineError, answerQuestion, flagQuestion, startAttempt, submitAttempt } from "@/lib/engine";
import type { FormState } from "./auth";

const examIds = EXAMS.map((e) => e.id) as [string, ...string[]];

const setupSchema = z.object({
  examId: z.enum(examIds, { message: "Choose the exam you are preparing for" }),
  examDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker")]).optional(),
  institution: z.string().trim().max(120).optional(),
});

/** Saves the exam the user is preparing for, their exam date and their training institution. */
export async function saveSetup(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = setupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { examId, examDate, institution } = parsed.data;
  await prisma.user.update({
    where: { id: userId },
    data: { targetExamId: examId, examDate: examDate ? new Date(`${examDate}T00:00:00.000Z`) : null, institution: institution || null },
  });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

const startSchema = z.object({
  examId: z.enum(examIds),
  mode: z.enum(["PRACTICE", "SIMULATION"]),
  count: z.coerce.number().int().min(5).max(100).optional(),
  domainIds: z.array(z.string()).optional(),
});

export async function startTest(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = startSchema.safeParse({
    examId: formData.get("examId"),
    mode: formData.get("mode"),
    count: formData.get("count") || undefined,
    domainIds: formData.getAll("domainIds").map(String),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  let id: string;
  try {
    id = (await startAttempt(userId, parsed.data)).id;
  } catch (e) {
    if (e instanceof EngineError) return { error: e.message };
    throw e;
  }
  redirect(`/test/${id}`);
}

// Called from the test runner (client). Errors come back as { error } so the UI can show them.
type Result<T> = ({ ok: true } & T) | { ok: false; error: string };
async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    if (e instanceof EngineError) return { ok: false, error: e.message };
    throw e;
  }
}

export async function answer(attemptId: string, position: number, choice: string) {
  const userId = await requireUserId();
  return run(() => answerQuestion(userId, attemptId, position, choice));
}

export async function flag(attemptId: string, position: number, flagged: boolean) {
  const userId = await requireUserId();
  return run(async () => { await flagQuestion(userId, attemptId, position, flagged); return {}; });
}

export async function submit(attemptId: string) {
  const userId = await requireUserId();
  const r = await run(async () => { await submitAttempt(userId, attemptId); return {}; });
  if (r.ok) revalidatePath("/dashboard");
  return r;
}
