import Link from "next/link";
import { getExam } from "@/lib/exams";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { card } from "@/lib/ui";

export default async function HistoryPage() {
  const userId = await requireUserId();
  const attempts = await prisma.attempt.findMany({ where: { userId }, orderBy: { startedAt: "desc" }, take: 100 });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">History</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Every practice set and simulation you have taken. Retake as often as you like.</p>
      </div>
      <div className={`${card} overflow-x-auto p-0`}>
        {attempts.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Questions</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{a.startedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{getExam(a.examId)?.name ?? a.examId}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.mode === "SIMULATION" ? "Simulation" : "Practice"}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{a.questionCount}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">
                    {a.status === "IN_PROGRESS" ? (
                      <span className="text-slate-500">In progress</span>
                    ) : (
                      <span className={a.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>{a.scorePercent}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={a.status === "IN_PROGRESS" ? `/test/${a.id}` : `/test/${a.id}/results`} className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
                      {a.status === "IN_PROGRESS" ? "Resume" : "Review"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-5 text-sm text-slate-500 dark:text-slate-400">No tests yet.</p>
        )}
      </div>
    </div>
  );
}
