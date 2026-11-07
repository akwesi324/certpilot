import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDomain, getExam } from "@/lib/exams";
import { contentHash, OPTION_KEYS } from "@/lib/questions";

/**
 * Question generation with the Claude API. Questions are original, written against the public
 * exam objectives in src/lib/exams.ts, validated, deduplicated and stored as GENERATED.
 */

export const MODEL = "claude-opus-5-5";
export const MAX_PER_REQUEST = 15;
/** Stop generating for a domain once it holds this many active questions. */
export const DOMAIN_CAP = Number(process.env.QUESTIONS_PER_DOMAIN_CAP || 300);

export class GenerateError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const Choice = z.enum(OPTION_KEYS);
const Options = z.object({ A: z.string(), B: z.string(), C: z.string(), D: z.string() });

const GeneratedSchema = z.object({
  questions: z.array(
    z.object({
      topic: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      stem: z.string(),
      options: Options,
      answer: Choice,
      explanations: Options,
    }),
  ),
});
type Generated = z.infer<typeof GeneratedSchema>["questions"][number];

// Fixed instructions first so they can be cached across requests; the exam details follow.
const SYSTEM = `You write practice questions for cybersecurity certification candidates.

Rules:
- Write original multiple-choice questions. Never reproduce or paraphrase real exam questions, brain-dump material or copyrighted course content.
- Each question has exactly four options, A to D, and exactly one correct answer.
- Distractors must be plausible to someone who half-knows the topic, but clearly wrong to someone who knows it well.
- Prefer short scenarios ("A company...", "An analyst notices...") that test understanding and application, not trivia.
- Explanations: for every option, one or two sentences saying why it is right or wrong. The correct option's explanation starts with "Correct."
- Vary which letter holds the correct answer.
- Only use facts you are certain of; if a topic would need a figure you are unsure of, ask about something else in that topic.
- Plain text only, no markdown.`;

function client() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new GenerateError("Question generation is not configured: set ANTHROPIC_API_KEY in the environment.", 503);
  }
  return new Anthropic();
}

function check(q: Generated, topics: string[]): string | null {
  if (q.stem.trim().length < 20) return "stem too short";
  const opts = OPTION_KEYS.map((k) => q.options[k].trim().toLowerCase());
  if (opts.some((o) => !o) || new Set(opts).size !== 4) return "empty or duplicate options";
  if (OPTION_KEYS.some((k) => q.explanations[k].trim().length < 10)) return "missing explanation";
  if (!topics.includes(q.topic)) return "topic not in the objectives";
  return null;
}

export type GenerateRequest = {
  examId: string;
  domainId: string;
  count: number;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  topic?: string;
};

export async function generateQuestions(req: GenerateRequest) {
  const exam = getExam(req.examId);
  const domain = getDomain(req.examId, req.domainId);
  if (!exam || !domain) throw new GenerateError("Unknown exam or domain.");
  if (req.topic && !domain.topics.includes(req.topic)) throw new GenerateError("That topic is not part of this domain.");

  const existing = await prisma.question.count({ where: { examId: exam.id, domainId: domain.id, active: true } });
  if (existing >= DOMAIN_CAP) throw new GenerateError(`This domain already has ${existing} questions (limit ${DOMAIN_CAP}).`, 409);
  const count = Math.min(Math.max(Math.floor(req.count) || 1, 1), MAX_PER_REQUEST, DOMAIN_CAP - existing);

  // Recent stems, so the model avoids repeating what the bank already covers.
  const recent = await prisma.question.findMany({
    where: { examId: exam.id, domainId: domain.id },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: { stem: true },
  });

  const prompt = [
    `Exam: ${exam.vendor} ${exam.name} (${exam.code})`,
    `Domain: ${domain.name} (${domain.weight}% of the exam)`,
    `Objectives in this domain (use these exact strings for "topic"):`,
    ...domain.topics.map((t) => `- ${t}`),
    "",
    req.topic ? `Write all questions on this objective: ${req.topic}` : "Spread the questions across the objectives.",
    `Difficulty: ${req.difficulty && req.difficulty !== "mixed" ? req.difficulty : "a mix of easy, medium and hard, mostly medium"}.`,
    `Write ${count} questions.`,
    recent.length ? `\nDo not repeat these existing questions:\n${recent.map((r) => `- ${r.stem}`).join("\n")}` : "",
  ].join("\n");

  let response;
  try {
    response = await client().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // if a cyber topic is declined, it is retried on the recommended model
      output_config: { effort: "medium", format: betaZodOutputFormat(GeneratedSchema) },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new GenerateError("The Claude API key was rejected.", 503);
    if (e instanceof Anthropic.RateLimitError) throw new GenerateError("The Claude API rate limit was reached. Try again in a minute.", 429);
    if (e instanceof Anthropic.APIError) throw new GenerateError(`The Claude API returned an error (${e.status}).`, 502);
    throw e;
  }
  if (response.stop_reason === "refusal") throw new GenerateError("The model declined this request. Try a different topic or difficulty.", 422);
  if (response.stop_reason === "max_tokens") throw new GenerateError("The response was cut off. Ask for fewer questions.", 502);
  const parsed = response.parsed_output;
  if (!parsed) throw new GenerateError("The model did not return questions in the expected format.", 502);

  let added = 0;
  const skipped: string[] = [];
  for (const q of parsed.questions) {
    const problem = check(q, domain.topics);
    if (problem) { skipped.push(problem); continue; }
    const hash = contentHash(q.stem, q.options);
    const created = await prisma.question.createMany({
      data: [{
        examId: exam.id, domainId: domain.id, topic: q.topic, difficulty: q.difficulty, stem: q.stem.trim(),
        options: q.options, answer: q.answer, explanations: q.explanations, source: "GENERATED", model: response.model, contentHash: hash,
      }],
      skipDuplicates: true,
    });
    if (created.count) added += 1; else skipped.push("duplicate");
  }
  return { requested: count, added, skipped, total: existing + added, model: response.model };
}
