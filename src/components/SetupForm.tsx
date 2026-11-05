"use client";

import { useActionState, useState } from "react";
import { saveSetup } from "@/app/actions/study";
import type { FormState } from "@/app/actions/auth";
import { btnPrimary, card, input, label } from "@/lib/ui";

type ExamOption = { id: string; name: string; code: string; vendor: string; questions: number; minutes: number };

export default function SetupForm({ exams, current }: { exams: ExamOption[]; current: { examId: string; examDate: string; institution: string } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSetup, undefined);
  const [examId, setExamId] = useState(current.examId);
  return (
    <form action={action} className="space-y-6">
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Exam</legend>
        {exams.map((e) => (
          <label
            key={e.id}
            className={`${card} cursor-pointer transition ${examId === e.id ? "border-indigo-500 ring-2 ring-indigo-500/30 dark:border-indigo-400" : "hover:border-slate-300 dark:hover:border-slate-700"}`}
          >
            <input type="radio" name="examId" value={e.id} checked={examId === e.id} onChange={() => setExamId(e.id)} className="sr-only" />
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{e.vendor}</span>
            <span className="mt-1 block font-semibold text-slate-900 dark:text-white">{e.name}</span>
            <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
              {e.code} &middot; {e.questions} questions &middot; {e.minutes} min
            </span>
          </label>
        ))}
      </fieldset>
      <div className={`${card} grid gap-4 sm:grid-cols-2`}>
        <label className="block space-y-1">
          <span className={label}>Exam date (optional)</span>
          <input type="date" name="examDate" defaultValue={current.examDate} className={input} />
        </label>
        <label className="block space-y-1">
          <span className={label}>Institution / training provider (optional)</span>
          <input name="institution" defaultValue={current.institution} maxLength={120} placeholder="e.g. your university or bootcamp" className={input} />
        </label>
      </div>
      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
      <button type="submit" disabled={pending || !examId} className={btnPrimary}>
        {pending ? "Saving..." : "Save and continue"}
      </button>
    </form>
  );
}
