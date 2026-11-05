import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DomainBar from "@/components/DomainBar";
import ReviewList from "@/components/ReviewList";
import { EngineError, getResults } from "@/lib/engine";
import { getExam } from "@/lib/exams";
import { requireUserId } from "@/lib/session";
import { btnPrimary, btnSecondary, card } from "@/lib/ui";

export default async function ResultsPage({ params }: PageProps<"/test/[id]/results">) {
  const { id } = await params;
  const userId = await requireUserId();
  let r;
  try {
    r = await getResults(userId, id);
  } catch (e) {
    if (e instanceof EngineError) {
      if (/Submit the test/.test(e.message)) redirect(`/test/${id}`);
      notFound();
    }
    throw e;
  }
  const exam = getExam(r.examId);
  const minutes = r.submittedAt ? Math.round((new Date(r.submittedAt).getTime() - new Date(r.startedAt).getTime()) / 60000) : null;

  return (
    <div className="space-y-6">
      <div className={`${card} flex flex-wrap items-center gap-6`}>
        <div className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 ${r.passed ? "border-emerald-500" : "border-rose-500"}`}>
          <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{r.scorePercent}%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{r.correctCount}/{r.questionCount}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">{exam?.name} &middot; {r.mode === "SIMULATION" ? "Exam simulation" : "Practice"}</p>
          <h1 className={`text-2xl font-bold ${r.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {r.passed ? "Pass" : "Not yet"}: {r.passed ? `you scored ${r.passMark}% or more` : `the pass mark is ${r.passMark}%`}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {r.status === "EXPIRED" ? "Time ran out; the test was submitted automatically. " : ""}
            {minutes !== null ? `Finished in ${minutes} min${r.timeLimitSec ? ` of ${Math.round(r.timeLimitSec / 60)}` : ""}.` : ""}
            {r.shortened ? " This simulation was shortened because the question bank is still growing." : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/exams/${r.examId}`} className={btnPrimary}>Take another</Link>
          <Link href="/dashboard" className={btnSecondary}>Dashboard</Link>
        </div>
      </div>

      <section className={`${card} space-y-4`}>
        <h2 className="font-semibold text-slate-900 dark:text-white">By domain</h2>
        {r.byDomain.map((d) => (
          <DomainBar key={d.domainId} name={d.name} percent={d.percent} detail={`${d.correct}/${d.total}`} />
        ))}
        {r.byDomain.some((d) => (d.percent ?? 0) < r.passMark) && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Focus next on: {r.byDomain.filter((d) => (d.percent ?? 0) < r.passMark).sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0)).map((d) => d.name).join(", ")}.
          </p>
        )}
      </section>

      <ReviewList items={r.items} domainNames={Object.fromEntries((exam?.domains ?? []).map((d) => [d.id, d.name]))} />
    </div>
  );
}
