import Link from "next/link";
import { notFound } from "next/navigation";
import StartPanel from "@/components/StartPanel";
import { getExam, PASS_MARK } from "@/lib/exams";
import { questionCounts } from "@/lib/engine";
import { card } from "@/lib/ui";

export default async function ExamPage({ params }: PageProps<"/exams/[examId]">) {
  const { examId } = await params;
  const exam = getExam(examId);
  if (!exam) notFound();
  const counts = await questionCounts(exam.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/exams" className="text-sm text-slate-500 hover:underline dark:text-slate-400">&larr; All exams</Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{exam.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {exam.vendor} {exam.code} &middot; {exam.format.questions} questions in {exam.format.minutes} minutes &middot; official passing score{" "}
          {exam.officialPassing} &middot; CertPilot pass mark {PASS_MARK}%
        </p>
        <a href={exam.objectivesUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
          Official exam page &rarr;
        </a>
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-3">
          {exam.domains.map((d, i) => (
            <div key={d.id} className={card}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-semibold text-slate-900 dark:text-white">{i + 1}. {d.name}</h2>
                <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-slate-400">{d.weight}%</span>
              </div>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {d.topics.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{counts.get(d.id) ?? 0} questions in the bank</p>
            </div>
          ))}
        </section>
        <section className="space-y-4 lg:col-span-2">
          <StartPanel
            exam={{ id: exam.id, minutes: exam.format.minutes, questions: exam.format.questions, note: exam.format.note ?? null }}
            domains={exam.domains.map((d) => ({ id: d.id, name: d.name, available: counts.get(d.id) ?? 0 }))}
          />
        </section>
      </div>
    </div>
  );
}
