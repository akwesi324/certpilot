import Link from "next/link";
import { redirect } from "next/navigation";
import DomainBar from "@/components/DomainBar";
import StartPanel from "@/components/StartPanel";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getExam, PASS_MARK, primaryVideo } from "@/lib/exams";
import { questionCounts, readiness } from "@/lib/engine";
import { card } from "@/lib/ui";

function daysUntil(date: Date | null): number | null {
  return date ? Math.ceil((date.getTime() - Date.now()) / 86_400_000) : null;
}

export default async function DashboardPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, targetExamId: true, examDate: true, institution: true } });
  const exam = user.targetExamId ? getExam(user.targetExamId) : undefined;
  if (!exam) redirect("/setup");

  const [ready, recent, counts] = await Promise.all([
    readiness(userId, exam.id),
    prisma.attempt.findMany({ where: { userId, examId: exam.id }, orderBy: { startedAt: "desc" }, take: 5 }),
    questionCounts(exam.id),
  ]);
  const daysLeft = daysUntil(user.examDate);
  const answered = ready.reduce((a, d) => a + d.answered, 0);
  const overall = answered ? Math.round(ready.reduce((a, d) => a + (d.percent ?? 0) * d.answered, 0) / answered) : null;
  const lastSim = recent.find((a) => a.mode === "SIMULATION" && a.status !== "IN_PROGRESS");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Hi {user.name.split(" ")[0]}, you are preparing for</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {exam.name} <span className="font-normal text-slate-500 dark:text-slate-400">({exam.code})</span>
          </h1>
          {user.institution && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Studying with {user.institution}</p>}
        </div>
        <Link href="/setup" className="text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400">Change exam</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={card}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overall accuracy</p>
          <p className={`mt-1 text-3xl font-bold tabular-nums ${overall === null ? "text-slate-400" : overall >= PASS_MARK ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {overall === null ? "--" : `${overall}%`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pass mark {PASS_MARK}% &middot; {answered} answers</p>
        </div>
        <div className={card}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last simulation</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{lastSim ? `${lastSim.scorePercent}%` : "--"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{lastSim ? (lastSim.passed ? "Passed" : "Not yet passing") : "Take one when you feel ready"}</p>
        </div>
        <div className={card}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Exam day</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{daysLeft === null ? "--" : daysLeft >= 0 ? daysLeft : "Past"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{daysLeft === null ? "Set your date under Change exam" : daysLeft >= 0 ? "days to go" : "Update your exam date"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className={`${card} space-y-4 lg:col-span-3`}>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Readiness by domain</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Based on your recent answers. The line marks the {PASS_MARK}% pass mark. Click a domain to watch lessons.</p>
          </div>
          {ready.map((d) => (
            <DomainBar key={d.domainId} name={`${d.name} (${d.weight}%)`} percent={d.percent} detail={d.answered ? `${d.answered} answered` : undefined} href={primaryVideo(exam, exam.domains.find((x) => x.id === d.domainId)!).url} />
          ))}
        </section>
        <section className="space-y-4 lg:col-span-2">
          <StartPanel
            exam={{ id: exam.id, minutes: exam.format.minutes, questions: exam.format.questions, note: exam.format.note ?? null }}
            domains={exam.domains.map((d) => ({ id: d.id, name: d.name, available: counts.get(d.id) ?? 0 }))}
          />
        </section>
      </div>

      <section className={card}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent tests</h2>
          <Link href="/history" className="text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400">All history</Link>
        </div>
        {recent.length ? (
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{a.mode === "SIMULATION" ? "Simulation" : "Practice"}</span>
                  <span className="text-slate-500 dark:text-slate-400"> &middot; {a.questionCount} questions &middot; {a.startedAt.toLocaleDateString("en-GB")}</span>
                </span>
                {a.status === "IN_PROGRESS" ? (
                  <Link href={`/test/${a.id}`} className="font-semibold text-violet-600 hover:underline dark:text-violet-400">Resume</Link>
                ) : (
                  <Link href={`/test/${a.id}/results`} className={`font-semibold tabular-nums ${a.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {a.scorePercent}% {a.passed ? "pass" : "below 80%"}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No tests yet. Start with a short practice set.</p>
        )}
      </section>
    </div>
  );
}
