import Link from "next/link";
import { CATEGORY, EXAMS, VENDORS, examsByVendor } from "@/lib/exams";
import { prisma } from "@/lib/prisma";
import { card } from "@/lib/ui";

const anchor = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default async function ExamsPage() {
  const counts = await prisma.question.groupBy({ by: ["examId"], where: { active: true }, _count: { _all: true } });
  const countOf = (id: string) => counts.find((c) => c.examId === id)?._count._all ?? 0;
  const groups = examsByVendor();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exams</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every exam is broken down into the awarding body&apos;s official domains and weightings.
        </p>
      </div>

      <section className="space-y-6" aria-labelledby="category">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
          <h2 id="category" className="text-xl font-semibold text-slate-900 dark:text-white">{CATEGORY}</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {EXAMS.length} exams from {VENDORS.length} certification bodies
          </span>
        </div>
        <nav aria-label="Certification bodies" className="flex flex-wrap gap-2">
          {groups.map(({ vendor, exams }) => (
            <a
              key={vendor.name}
              href={`#${anchor(vendor.name)}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              {vendor.name} <span className="text-slate-400">{exams.length}</span>
            </a>
          ))}
        </nav>

        {groups.map(({ vendor, exams }) => (
          <section key={vendor.name} id={anchor(vendor.name)} className="scroll-mt-20 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                <a href={vendor.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{vendor.fullName}</a>
                {vendor.accredited && (
                  <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 align-middle text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    ISO/IEC 17024
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{vendor.about}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((e) => (
                <Link key={e.id} href={`/exams/${e.id}`} className={`${card} transition hover:border-indigo-400`}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{e.code}</span>
                  <h4 className="mt-1 font-semibold text-slate-900 dark:text-white">{e.name}</h4>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {e.format.questions} questions &middot; {e.format.minutes} min &middot; {e.domains.length} domains
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{countOf(e.id)} practice questions in the bank</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}
