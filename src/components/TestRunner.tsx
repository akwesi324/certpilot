"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { answer, flag, submit } from "@/app/actions/study";
import { btnPrimary, btnSecondary, card } from "@/lib/ui";

type Choice = "A" | "B" | "C" | "D";
const CHOICES: Choice[] = ["A", "B", "C", "D"];

export type RunnerItem = {
  position: number;
  domainId: string;
  topic: string;
  stem: string;
  options: Record<Choice, string>;
  selected: Choice | null;
  flagged: boolean;
  answer?: Choice;
  isCorrect?: boolean | null;
  explanations?: Record<Choice, string>;
};

type Props = {
  attemptId: string;
  examName: string;
  mode: "PRACTICE" | "SIMULATION";
  expiresAt: string | null;
  serverNow: string;
  items: RunnerItem[];
  domainNames: Record<string, string>;
  examLabel: string;
};

function formatClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h ? `${h}:` : ""}${String(m).padStart(h ? 2 : 1, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function TestRunner({ attemptId, examName, mode, expiresAt, serverNow, items: initial, domainNames, examLabel }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [current, setCurrent] = useState(() => Math.max(0, initial.findIndex((i) => !i.selected)));
  const [pick, setPick] = useState<Choice | null>(null); // practice: chosen but not yet checked
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const simulation = mode === "SIMULATION";
  const item = items[current];
  const revealed = !simulation && item.answer !== undefined;

  // Timer: server deadline corrected for the difference between the server and this device's clock.
  // The clock is read only in the effect (never during render).
  const deadline = expiresAt ? new Date(expiresAt).getTime() : null;
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!deadline) return;
    const skew = new Date(serverNow).getTime() - Date.now();
    const tick = () => setNow(Date.now() + skew);
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [deadline, serverNow]);
  const remaining = deadline && now !== null ? deadline - now : null;

  const finish = useCallback(async () => {
    setBusy(true);
    const r = await submit(attemptId);
    if (!r.ok) { setError(r.error); setBusy(false); return; }
    router.replace(`/test/${attemptId}/results`);
  }, [attemptId, router]);

  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (remaining !== null && remaining <= 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void finish();
    }
  }, [remaining, finish]);

  const update = (position: number, patch: Partial<RunnerItem>) =>
    setItems((list) => list.map((i) => (i.position === position ? { ...i, ...patch } : i)));

  async function choose(c: Choice) {
    if (busy || revealed) return;
    setError(null);
    if (!simulation) { setPick(c); return; }
    const before = item.selected;
    update(item.position, { selected: c });
    const r = await answer(attemptId, item.position, c);
    if (!r.ok) { update(item.position, { selected: before }); setError(r.error); if (/Time is up|finished/.test(r.error)) router.replace(`/test/${attemptId}/results`); }
  }

  async function check() {
    if (!pick) return;
    setBusy(true);
    const r = await answer(attemptId, item.position, pick);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    if ("answer" in r) update(item.position, { selected: pick, answer: r.answer, isCorrect: r.isCorrect, explanations: r.explanations });
    setPick(null);
  }

  async function toggleFlag() {
    const next = !item.flagged;
    update(item.position, { flagged: next });
    const r = await flag(attemptId, item.position, next);
    if (!r.ok) { update(item.position, { flagged: !next }); setError(r.error); }
  }

  const go = useCallback((i: number) => { setCurrent(Math.min(Math.max(i, 0), items.length - 1)); setPick(null); setError(null); }, [items.length]);

  // Keyboard: 1-4 or A-D choose, arrows move, Enter checks (practice).
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (confirming || (e.target as HTMLElement)?.tagName === "INPUT") return;
    const k = e.key.toUpperCase();
    const idx = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : "ABCD".indexOf(k);
    if (k.length === 1 && idx >= 0) { void choose(CHOICES[idx]); e.preventDefault(); }
    else if (e.key === "ArrowRight") go(current + 1);
    else if (e.key === "ArrowLeft") go(current - 1);
    else if (e.key === "Enter" && !simulation && pick) void check();
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const answeredCount = items.filter((i) => i.selected).length;
  const flaggedCount = items.filter((i) => i.flagged).length;
  const correctSoFar = items.filter((i) => i.isCorrect).length;
  const shown = revealed ? item.selected : simulation ? item.selected : pick;

  const optionClass = (c: Choice) => {
    const base = "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition";
    if (revealed) {
      if (c === item.answer) return `${base} border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10`;
      if (c === item.selected) return `${base} border-rose-500 bg-rose-50 dark:bg-rose-500/10`;
      return `${base} border-slate-200 opacity-80 dark:border-slate-800`;
    }
    return c === shown
      ? `${base} border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:bg-indigo-500/10`
      : `${base} border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600`;
  };

  const navClass = useMemo(() => (i: RunnerItem, idx: number) => {
    let c = "relative h-9 w-9 rounded-lg border text-xs font-semibold tabular-nums transition ";
    if (!simulation && i.answer !== undefined) c += i.isCorrect ? "border-emerald-500 bg-emerald-500 text-white " : "border-rose-500 bg-rose-500 text-white ";
    else if (i.selected) c += "border-indigo-500 bg-indigo-500 text-white ";
    else c += "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300 ";
    if (idx === current) c += "ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-950 ";
    return c;
  }, [current, simulation]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{examName} &middot; {simulation ? "Exam simulation" : "Practice"}</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            Question {current + 1} of {items.length}
            <span className="font-normal text-slate-500 dark:text-slate-400"> &middot; {domainNames[item.domainId] ?? ""}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {remaining !== null && (
            <span className={`rounded-lg px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${remaining < 5 * 60_000 ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`} aria-live="polite">
              {formatClock(remaining)}
            </span>
          )}
          {!simulation && <span className="text-sm text-slate-500 dark:text-slate-400">{correctSoFar}/{items.filter((i) => i.answer !== undefined).length} correct</span>}
          <button type="button" onClick={() => setConfirming(true)} disabled={busy} className={btnSecondary}>
            {simulation ? "Submit exam" : "Finish"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <section className={`${card} space-y-4 lg:col-span-3`}>
          <p className="whitespace-pre-line text-base leading-relaxed text-slate-900 dark:text-slate-100">{item.stem}</p>
          <div className="space-y-2" role="radiogroup" aria-label="Answer options">
            {CHOICES.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={shown === c} onClick={() => void choose(c)} disabled={revealed || busy} className={optionClass(c)}>
                <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current text-xs font-bold">{c}</span>
                <span className="text-slate-800 dark:text-slate-200">{item.options[c]}</span>
              </button>
            ))}
          </div>

          {revealed && item.explanations && (
            <div className={`rounded-xl p-4 text-sm ${item.isCorrect ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-rose-50 dark:bg-rose-500/10"}`}>
              <p className="font-semibold text-slate-900 dark:text-white">{item.isCorrect ? "Correct." : `Not quite. The answer is ${item.answer}.`}</p>
              <ul className="mt-2 space-y-1.5">
                {CHOICES.map((c) => (
                  <li key={c} className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{c}.</span> {item.explanations![c]}
                  </li>
                ))}
              </ul>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${examLabel} ${item.topic}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Watch a lesson: {item.topic} &rarr;
              </a>
            </div>
          )}

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex gap-2">
              <button type="button" onClick={() => go(current - 1)} disabled={current === 0} className={btnSecondary}>Previous</button>
              <button type="button" onClick={toggleFlag} className={btnSecondary} aria-pressed={item.flagged}>
                {item.flagged ? "Unflag" : "Flag for review"}
              </button>
            </div>
            <div className="flex gap-2">
              {!simulation && !revealed && (
                <button type="button" onClick={() => void check()} disabled={!pick || busy} className={btnPrimary}>Check answer</button>
              )}
              {current < items.length - 1 ? (
                <button type="button" onClick={() => go(current + 1)} className={simulation || revealed ? btnPrimary : btnSecondary}>Next</button>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} className={btnPrimary}>{simulation ? "Review and submit" : "Finish"}</button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400">Keys: 1-4 or A-D to answer, arrows to move{simulation ? "" : ", Enter to check"}.</p>
        </section>

        <aside className={`${card} space-y-3`}>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Questions</p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((i, idx) => (
              <button key={i.position} type="button" onClick={() => go(idx)} className={navClass(i, idx)} aria-label={`Question ${idx + 1}${i.flagged ? ", flagged" : ""}`}>
                {idx + 1}
                {i.flagged && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{answeredCount} answered &middot; {flaggedCount} flagged</p>
        </aside>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
          <div className={`${card} w-full max-w-md space-y-3`}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{simulation ? "Submit the exam?" : "Finish practice?"}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {answeredCount} of {items.length} answered{items.length - answeredCount ? `; ${items.length - answeredCount} unanswered will count as wrong` : ""}.
              {flaggedCount ? ` ${flaggedCount} flagged for review.` : ""}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirming(false)} className={btnSecondary}>Keep going</button>
              <button type="button" onClick={() => void finish()} disabled={busy} className={btnPrimary}>{busy ? "Scoring..." : "Submit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
