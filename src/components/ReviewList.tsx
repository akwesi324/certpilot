"use client";

import { useState } from "react";
import { card } from "@/lib/ui";

type Choice = "A" | "B" | "C" | "D";
const CHOICES: Choice[] = ["A", "B", "C", "D"];

type Item = {
  position: number;
  domainId: string;
  topic: string;
  stem: string;
  options: Record<Choice, string>;
  selected: Choice | null;
  answer: Choice;
  isCorrect: boolean;
  flagged: boolean;
  explanations: Record<Choice, string>;
};

const FILTERS = [
  { id: "wrong", label: "Incorrect" },
  { id: "flagged", label: "Flagged" },
  { id: "all", label: "All" },
] as const;

export default function ReviewList({ items, domainNames }: { items: Item[]; domainNames: Record<string, string> }) {
  const wrong = items.filter((i) => !i.isCorrect).length;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>(wrong ? "wrong" : "all");
  const list = items.filter((i) => (filter === "wrong" ? !i.isCorrect : filter === "flagged" ? i.flagged : true));

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">Review answers</h2>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-md px-3 py-1 text-sm font-medium ${filter === f.id ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
            >
              {f.label} ({f.id === "wrong" ? wrong : f.id === "flagged" ? items.filter((i) => i.flagged).length : items.length})
            </button>
          ))}
        </div>
      </div>
      {list.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Nothing here.</p>}
      {list.map((i) => (
        <article key={i.position} className={card}>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Question {i.position + 1} &middot; {domainNames[i.domainId]} &middot; {i.topic}
            {i.flagged ? " · flagged" : ""}
          </p>
          <p className="mt-1 font-medium text-slate-900 dark:text-white">{i.stem}</p>
          <ul className="mt-3 space-y-2">
            {CHOICES.map((c) => {
              const isAnswer = c === i.answer;
              const isMine = c === i.selected;
              return (
                <li
                  key={c}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isAnswer ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : isMine ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <p className="text-slate-800 dark:text-slate-200">
                    <span className="font-semibold">{c}.</span> {i.options[c]}
                    {isAnswer && <span className="ml-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">correct answer</span>}
                    {isMine && !isAnswer && <span className="ml-2 text-xs font-semibold text-rose-700 dark:text-rose-400">your answer</span>}
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{i.explanations[c]}</p>
                </li>
              );
            })}
          </ul>
          {!i.selected && <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">Not answered.</p>}
        </article>
      ))}
    </section>
  );
}
