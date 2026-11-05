import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { getExam, questionsPerDomain, PASS_MARK, type Exam } from "@/lib/exams";
import type { AttemptMode, Prisma } from "@prisma/client";

/**
 * Test engine. All rules live on the server:
 *  - practice: an answer is locked once submitted, and the explanation is shown right away
 *  - simulation: answers can change until submission, nothing is revealed until the end, and the
 *    time limit is enforced here (an overdue attempt is submitted automatically)
 */

export class EngineError extends Error {}

export type Choice = "A" | "B" | "C" | "D";
const CHOICES: Choice[] = ["A", "B", "C", "D"];
const GRACE_MS = 5_000; // network slack on the simulation deadline

export const PRACTICE_SIZES = [10, 20, 30, 50] as const;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function requireExam(examId: string): Exam {
  const exam = getExam(examId);
  if (!exam) throw new EngineError("Unknown exam.");
  return exam;
}

/** Active questions per domain for an exam. */
export async function questionCounts(examId: string): Promise<Map<string, number>> {
  const rows = await prisma.question.groupBy({ by: ["domainId"], where: { examId, active: true }, _count: { _all: true } });
  return new Map(rows.map((r) => [r.domainId, r._count._all]));
}

/**
 * Picks `n` questions from a domain, preferring the ones this user has seen least, random
 * within the same "seen" count.
 */
async function pickQuestions(userId: string, examId: string, domainId: string, n: number): Promise<string[]> {
  if (n <= 0) return [];
  const pool = await prisma.question.findMany({ where: { examId, domainId, active: true }, select: { id: true } });
  if (!pool.length) return [];
  const seen = await prisma.attemptItem.groupBy({
    by: ["questionId"],
    where: { questionId: { in: pool.map((q) => q.id) }, attempt: { userId } },
    _count: { _all: true },
  });
  const seenMap = new Map(seen.map((s) => [s.questionId, s._count._all]));
  return shuffle(pool)
    .sort((a, b) => (seenMap.get(a.id) ?? 0) - (seenMap.get(b.id) ?? 0))
    .slice(0, n)
    .map((q) => q.id);
}

export type StartOptions = { examId: string; mode: AttemptMode; domainIds?: string[]; count?: number };

/**
 * Starts a test. A simulation uses the real exam's question count and time limit, spread across
 * domains by their official weight. If the question bank is still smaller than a full exam, the
 * simulation is shortened and its time limit scaled to match (the result says so).
 */
export async function startAttempt(userId: string, opts: StartOptions) {
  const exam = requireExam(opts.examId);
  const domainIds = (opts.domainIds ?? []).filter((d) => exam.domains.some((x) => x.id === d));
  const simulation = opts.mode === "SIMULATION";
  const wanted = simulation ? exam.format.questions : Math.min(Math.max(Math.floor(opts.count ?? 20), 5), 100);

  const counts = await questionCounts(exam.id);
  const scope = simulation || !domainIds.length ? exam.domains.map((d) => d.id) : domainIds;
  const availableTotal = scope.reduce((a, d) => a + (counts.get(d) ?? 0), 0);
  if (!availableTotal) throw new EngineError("There are no questions for this selection yet. Generate a question bank first.");

  // Per-domain targets by weight, capped by what each domain actually has; leftovers are filled
  // from domains that still have unused questions.
  const total = Math.min(wanted, availableTotal);
  const plan = questionsPerDomain(exam, total, simulation ? undefined : domainIds);
  let shortfall = 0;
  for (const [d, n] of plan) {
    const have = counts.get(d) ?? 0;
    if (n > have) { shortfall += n - have; plan.set(d, have); }
  }
  for (const d of scope) {
    if (shortfall <= 0) break;
    const spare = (counts.get(d) ?? 0) - (plan.get(d) ?? 0);
    const add = Math.min(spare, shortfall);
    if (add > 0) { plan.set(d, (plan.get(d) ?? 0) + add); shortfall -= add; }
  }

  const ids: string[] = [];
  for (const [d, n] of plan) ids.push(...(await pickQuestions(userId, exam.id, d, n)));
  const order = shuffle(ids);
  const timeLimitSec = simulation ? Math.round((exam.format.minutes * 60 * order.length) / exam.format.questions) : null;

  return prisma.attempt.create({
    data: {
      userId,
      examId: exam.id,
      mode: opts.mode,
      domainIds: simulation ? [] : domainIds,
      questionCount: order.length,
      timeLimitSec,
      expiresAt: timeLimitSec ? new Date(Date.now() + timeLimitSec * 1000) : null,
      // Options are shuffled per question per attempt, so positions cannot be memorised.
      items: { create: order.map((questionId, position) => ({ questionId, position, optionOrder: shuffle(CHOICES).join("") })) },
    },
    select: { id: true, questionCount: true, timeLimitSec: true },
  });
}

type AttemptWithItems = Prisma.AttemptGetPayload<{ include: { items: { include: { question: true } } } }>;
type Item = AttemptWithItems["items"][number];

/** An item as displayed: options re-lettered A-D in this attempt's shuffled order. */
function displayed(i: Item) {
  const order = i.optionOrder.split("") as Choice[];
  const opts = i.question.options as Record<Choice, string>;
  const expl = i.question.explanations as Record<Choice, string>;
  const toShown = (orig: string | null) => (orig ? CHOICES[order.indexOf(orig as Choice)] : null);
  return {
    options: Object.fromEntries(CHOICES.map((c, k) => [c, opts[order[k]]])) as Record<Choice, string>,
    explanations: Object.fromEntries(CHOICES.map((c, k) => [c, expl[order[k]]])) as Record<Choice, string>,
    answer: toShown(i.question.answer) as Choice,
    selected: toShown(i.selected),
  };
}

async function loadAttempt(userId: string, attemptId: string): Promise<AttemptWithItems> {
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId },
    include: { items: { orderBy: { position: "asc" }, include: { question: true } } },
  });
  if (!attempt) throw new EngineError("Test not found.");
  return attempt;
}

/** Scores and closes an attempt. Unanswered questions count as wrong. */
async function finalize(attempt: AttemptWithItems, status: "SUBMITTED" | "EXPIRED") {
  const correctCount = attempt.items.filter((i) => i.isCorrect).length;
  const scorePercent = attempt.questionCount ? Math.round((correctCount / attempt.questionCount) * 1000) / 10 : 0;
  // Only close it if it is still open (two tabs submitting at once score it once).
  await prisma.attempt.updateMany({
    where: { id: attempt.id, status: "IN_PROGRESS" },
    data: { status, submittedAt: new Date(), correctCount, scorePercent, passed: scorePercent >= PASS_MARK },
  });
}

/** Closes a simulation whose time is up. Returns true if it did. */
async function expireIfOverdue(attempt: AttemptWithItems): Promise<boolean> {
  if (attempt.status !== "IN_PROGRESS" || !attempt.expiresAt) return false;
  if (Date.now() <= attempt.expiresAt.getTime() + GRACE_MS) return false;
  await finalize(attempt, "EXPIRED");
  return true;
}

/** The attempt as the test-taker sees it: correct answers only where they may be revealed. */
export async function getAttemptView(userId: string, attemptId: string) {
  let attempt = await loadAttempt(userId, attemptId);
  if (await expireIfOverdue(attempt)) attempt = await loadAttempt(userId, attemptId);
  const reveal = (i: Item) => attempt.status !== "IN_PROGRESS" || (attempt.mode === "PRACTICE" && i.selected !== null);
  return {
    id: attempt.id,
    examId: attempt.examId,
    mode: attempt.mode,
    status: attempt.status,
    questionCount: attempt.questionCount,
    timeLimitSec: attempt.timeLimitSec,
    expiresAt: attempt.expiresAt?.toISOString() ?? null,
    serverNow: new Date().toISOString(),
    items: attempt.items.map((i) => {
      const d = displayed(i);
      return {
        position: i.position,
        domainId: i.question.domainId,
        stem: i.question.stem,
        options: d.options,
        selected: d.selected,
        flagged: i.flagged,
        ...(reveal(i) ? { answer: d.answer, isCorrect: i.isCorrect, explanations: d.explanations } : {}),
      };
    }),
  };
}

export async function answerQuestion(userId: string, attemptId: string, position: number, choice: string) {
  if (!CHOICES.includes(choice as Choice)) throw new EngineError("Invalid answer.");
  const attempt = await loadAttempt(userId, attemptId);
  if (await expireIfOverdue(attempt)) throw new EngineError("Time is up. The test has been submitted.");
  if (attempt.status !== "IN_PROGRESS") throw new EngineError("This test is already finished.");
  const item = attempt.items.find((i) => i.position === position);
  if (!item) throw new EngineError("Question not found.");
  if (attempt.mode === "PRACTICE" && item.selected) throw new EngineError("You already answered this question.");
  const original = item.optionOrder[CHOICES.indexOf(choice as Choice)]; // displayed letter -> original key
  const isCorrect = item.question.answer === original;
  await prisma.attemptItem.update({ where: { id: item.id }, data: { selected: original, isCorrect, answeredAt: new Date() } });
  if (attempt.mode === "SIMULATION") return { saved: true as const };
  const d = displayed({ ...item, selected: original });
  return { saved: true as const, isCorrect, answer: d.answer, explanations: d.explanations };
}

export async function flagQuestion(userId: string, attemptId: string, position: number, flagged: boolean) {
  const attempt = await loadAttempt(userId, attemptId);
  if (attempt.status !== "IN_PROGRESS") throw new EngineError("This test is already finished.");
  const item = attempt.items.find((i) => i.position === position);
  if (!item) throw new EngineError("Question not found.");
  await prisma.attemptItem.update({ where: { id: item.id }, data: { flagged } });
}

export async function submitAttempt(userId: string, attemptId: string) {
  const attempt = await loadAttempt(userId, attemptId);
  if (attempt.status === "IN_PROGRESS") {
    const overdue = attempt.expiresAt && Date.now() > attempt.expiresAt.getTime() + GRACE_MS;
    await finalize(attempt, overdue ? "EXPIRED" : "SUBMITTED");
  }
  return getResults(userId, attemptId);
}

/** Full results (only after the attempt is closed): score, pass/fail and a per-domain breakdown. */
export async function getResults(userId: string, attemptId: string) {
  let attempt = await loadAttempt(userId, attemptId);
  if (await expireIfOverdue(attempt)) attempt = await loadAttempt(userId, attemptId);
  if (attempt.status === "IN_PROGRESS") throw new EngineError("Submit the test to see your results.");
  const exam = requireExam(attempt.examId);
  const byDomain = exam.domains
    .map((d) => {
      const items = attempt.items.filter((i) => i.question.domainId === d.id);
      const correct = items.filter((i) => i.isCorrect).length;
      return { domainId: d.id, name: d.name, weight: d.weight, total: items.length, correct, percent: items.length ? Math.round((correct / items.length) * 1000) / 10 : null };
    })
    .filter((d) => d.total > 0);
  return {
    id: attempt.id,
    examId: attempt.examId,
    mode: attempt.mode,
    status: attempt.status,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
    timeLimitSec: attempt.timeLimitSec,
    shortened: attempt.mode === "SIMULATION" && attempt.questionCount < exam.format.questions,
    questionCount: attempt.questionCount,
    correctCount: attempt.correctCount ?? 0,
    scorePercent: attempt.scorePercent ?? 0,
    passed: Boolean(attempt.passed),
    passMark: PASS_MARK,
    byDomain,
    items: attempt.items.map((i) => {
      const d = displayed(i);
      return {
        position: i.position,
        domainId: i.question.domainId,
        topic: i.question.topic,
        stem: i.question.stem,
        options: d.options,
        selected: d.selected,
        answer: d.answer,
        isCorrect: Boolean(i.isCorrect),
        flagged: i.flagged,
        explanations: d.explanations,
      };
    }),
  };
}

/** Per-domain accuracy over the user's recent answers for an exam (readiness view). */
export async function readiness(userId: string, examId: string, recent = 300) {
  const exam = requireExam(examId);
  const items = await prisma.attemptItem.findMany({
    where: { attempt: { userId, examId }, selected: { not: null } },
    orderBy: { answeredAt: "desc" },
    take: recent,
    select: { isCorrect: true, question: { select: { domainId: true } } },
  });
  return exam.domains.map((d) => {
    const mine = items.filter((i) => i.question.domainId === d.id);
    const correct = mine.filter((i) => i.isCorrect).length;
    return { domainId: d.id, name: d.name, weight: d.weight, answered: mine.length, percent: mine.length ? Math.round((correct / mine.length) * 100) : null };
  });
}
