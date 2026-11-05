import Link from "next/link";
import { EXAMS } from "@/lib/exams";
import { prisma } from "@/lib/prisma";
import { card } from "@/lib/ui";

export default async function ExamsPage() {
  const counts = await prisma.question.groupBy({ by: ["examId"], where: { active: true }, _count: { _all: true } });
  const countOf = (id: string) => counts.find((c) => c.examId === id)?._count._all ?? 0;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exams</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Every exam is broken down into the vendor&apos;s official domains and weightings.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMS.map((e) => (
          <Link key={e.id} href={`/exams/${e.id}`} className={`${card} transition hover:border-indigo-400`}>
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{e.vendor}</span>
            <h2 className="mt-1 font-semibold text-slate-900 dark:text-white">{e.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{e.code}</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {e.format.questions} questions &middot; {e.format.minutes} min &middot; {e.domains.length} domains
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{countOf(e.id)} practice questions in the bank</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
