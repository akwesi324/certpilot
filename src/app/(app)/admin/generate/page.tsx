import { notFound } from "next/navigation";
import GenerateForm from "@/components/GenerateForm";
import { isAdmin } from "@/lib/admin";
import { DOMAIN_CAP, MAX_PER_REQUEST } from "@/lib/generate";
import { EXAMS } from "@/lib/exams";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function GeneratePage() {
  const userId = await requireUserId();
  if (!(await isAdmin(userId))) notFound();
  const counts = await prisma.question.groupBy({ by: ["domainId"], where: { active: true }, _count: { _all: true } });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Question bank</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Generate original questions for a domain. Up to {MAX_PER_REQUEST} per run, {DOMAIN_CAP} per domain. Every question is checked and
          deduplicated before it is stored.
        </p>
      </div>
      <GenerateForm
        configured={Boolean(process.env.ANTHROPIC_API_KEY)}
        maxPerRequest={MAX_PER_REQUEST}
        exams={EXAMS.map((e) => ({
          id: e.id,
          name: `${e.name} (${e.code})`,
          domains: e.domains.map((d) => ({ id: d.id, name: d.name, topics: d.topics, count: counts.find((c) => c.domainId === d.id)?._count._all ?? 0 })),
        }))}
      />
    </div>
  );
}
