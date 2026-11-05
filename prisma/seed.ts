import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { STARTER_QUESTIONS } from "./starter-questions.ts";

/** Loads the starter question bank. Safe to run repeatedly (questions are deduplicated). */
const prisma = new PrismaClient();

export function contentHash(stem: string, options: Record<string, string>): string {
  return createHash("sha256").update(JSON.stringify([stem.trim(), ["A", "B", "C", "D"].map((k) => options[k].trim())])).digest("hex");
}

async function main() {
  let added = 0;
  for (const q of STARTER_QUESTIONS) {
    const hash = contentHash(q.stem, q.options);
    const exists = await prisma.question.findUnique({ where: { contentHash: hash }, select: { id: true } });
    if (exists) continue;
    await prisma.question.create({
      data: {
        examId: q.examId,
        domainId: q.domainId,
        topic: q.topic,
        difficulty: q.difficulty,
        stem: q.stem,
        options: q.options,
        answer: q.answer,
        explanations: q.explanations,
        source: "STARTER",
        contentHash: hash,
      },
    });
    added += 1;
  }
  console.log(`Starter bank: ${added} added, ${STARTER_QUESTIONS.length - added} already present.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
