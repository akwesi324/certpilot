"use client";

import { useActionState, useState } from "react";
import { startTest } from "@/app/actions/study";
import type { FormState } from "@/app/actions/auth";
import { btnPrimary, btnSecondary, card, input, label } from "@/lib/ui";

type Props = {
  exam: { id: string; minutes: number; questions: number; note: string | null };
  domains: { id: string; name: string; available: number }[];
};

export default function StartPanel({ exam, domains }: Props) {
  const [practiceState, practiceAction, practicePending] = useActionState<FormState, FormData>(startTest, undefined);
  const [simState, simAction, simPending] = useActionState<FormState, FormData>(startTest, undefined);
  const [picked, setPicked] = useState<string[]>([]);
  const total = domains.reduce((a, d) => a + d.available, 0);
  const pool = picked.length ? domains.filter((d) => picked.includes(d.id)).reduce((a, d) => a + d.available, 0) : total;
  const shortSim = total < exam.questions;

  return (
    <>
      <form action={practiceAction} className={`${card} space-y-3`}>
        <input type="hidden" name="examId" value={exam.id} />
        <input type="hidden" name="mode" value="PRACTICE" />
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Practice</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Untimed. You see the answer and an explanation for every option straight after each question.</p>
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">Focus on domains {picked.length ? `(${picked.length} selected)` : "(all)"}</summary>
          <div className="mt-2 space-y-1.5">
            {domains.map((d) => (
              <label key={d.id} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="domainIds"
                  value={d.id}
                  checked={picked.includes(d.id)}
                  onChange={(e) => setPicked((p) => (e.target.checked ? [...p, d.id] : p.filter((x) => x !== d.id)))}
                  className="mt-0.5"
                />
                <span>{d.name} <span className="text-slate-400">({d.available})</span></span>
              </label>
            ))}
          </div>
        </details>
        <label className="block space-y-1">
          <span className={label}>Questions</span>
          <select name="count" defaultValue="20" className={input}>
            {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}{n > pool ? ` (only ${pool} available)` : ""}</option>)}
          </select>
        </label>
        {practiceState?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{practiceState.error}</p>}
        <button type="submit" disabled={practicePending || pool === 0} className={`${btnPrimary} w-full`}>
          {practicePending ? "Preparing..." : "Start practice"}
        </button>
      </form>

      <form action={simAction} className={`${card} space-y-3`}>
        <input type="hidden" name="examId" value={exam.id} />
        <input type="hidden" name="mode" value="SIMULATION" />
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Exam simulation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real exam conditions: {exam.questions} questions in {exam.minutes} minutes, weighted like the real exam. No feedback until you submit;
            the timer cannot be paused. Pass mark 80%.
          </p>
          {exam.note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{exam.note}</p>}
          {shortSim && total > 0 && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              The question bank has {total} questions so far, so the simulation will be shortened to {total} with the time scaled to match.
            </p>
          )}
        </div>
        {simState?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{simState.error}</p>}
        <button type="submit" disabled={simPending || total === 0} className={`${btnSecondary} w-full`}>
          {simPending ? "Preparing..." : "Start simulation"}
        </button>
      </form>
    </>
  );
}
