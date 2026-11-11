"use client";

import { useActionState, useState } from "react";
import { saveSetup } from "@/app/actions/study";
import type { FormState } from "@/app/actions/auth";
import { btnPrimary, card, input, label } from "@/lib/ui";

type ExamOption = { id: string; name: string; code: string; questions: number; minutes: number };
export type ExamGroup = { vendor: string; about: string; exams: ExamOption[] };

export default function SetupForm({
  category,
  groups,
  current,
}: {
  category: string;
  groups: ExamGroup[];
  current: { examId: string; examDate: string; institution: string };
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSetup, undefined);
  const [examId, setExamId] = useState(current.examId || "secplus");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = groups
    .map((g) => ({
      ...g,
      exams: q ? g.exams.filter((e) => `${g.vendor} ${e.name} ${e.code}`.toLowerCase().includes(q)) : g.exams,
    }))
    .filter((g) => g.exams.length > 0);
  // The group holding the saved exam starts open (or the first group if none is saved yet).
  const initialGroup = groups.find((g) => g.exams.some((e) => e.id === (current.examId || "secplus")))?.vendor ?? groups[0]?.vendor;
  const selected = groups.flatMap((g) => g.exams.map((e) => ({ ...e, vendor: g.vendor }))).find((e) => e.id === examId);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="examId" value={examId} />
      <fieldset className="space-y-3">
        <legend className="mb-2 flex w-full flex-wrap items-center justify-between gap-2">
          <span className="text-lg font-semibold text-slate-900 dark:text-white">{category}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exams, e.g. CISM or SC-200"
            aria-label="Search exams"
            className={`${input} sm:max-w-xs`}
          />
        </legend>
        {selected && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Selected: <span className="font-medium text-slate-900 dark:text-white">{selected.name.startsWith(selected.vendor) ? selected.name : `${selected.vendor} ${selected.name}`}</span> ({selected.code})
          </p>
        )}
        {visible.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No exams match &ldquo;{query}&rdquo;.</p>}
        {visible.map((g) => (
          <details
            key={g.vendor}
            open={Boolean(q) || g.vendor === initialGroup}
            className="group rounded-xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
              <span>
                <span className="font-semibold text-slate-900 dark:text-white">{g.vendor}</span>
                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{g.exams.length} exams</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{g.about}</span>
              </span>
              <span aria-hidden className="text-slate-400 transition group-open:rotate-90">&#9656;</span>
            </summary>
            <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
              {g.exams.map((e) => (
                <label
                  key={e.id}
                  onClick={() => setExamId(e.id)}
                  className={`${card} cursor-pointer transition ${examId === e.id ? "border-violet-500 ring-2 ring-violet-500/30 dark:border-violet-400" : "hover:border-slate-300 dark:hover:border-slate-700"}`}
                >
                  <input type="radio" name="examIdRadio" value={e.id} checked={examId === e.id} onChange={() => setExamId(e.id)} className="sr-only" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">{e.code}</span>
                  <span className="mt-1 block font-semibold text-slate-900 dark:text-white">{e.name}</span>
                  <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                    {e.questions} questions &middot; {e.minutes} min
                  </span>
                </label>
              ))}
            </div>
          </details>
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
