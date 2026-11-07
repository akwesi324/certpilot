"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, card, input, label } from "@/lib/ui";

type ExamOpt = { id: string; name: string; domains: { id: string; name: string; topics: string[]; count: number }[] };
type Result = { added: number; requested: number; skipped: string[]; total: number; model: string };

export default function GenerateForm({ exams, configured, maxPerRequest }: { exams: ExamOpt[]; configured: boolean; maxPerRequest: number }) {
  const router = useRouter();
  const [examId, setExamId] = useState(exams[0].id);
  const exam = exams.find((e) => e.id === examId)!;
  const [domainId, setDomainId] = useState(exam.domains[0].id);
  const domain = exam.domains.find((d) => d.id === domainId) ?? exam.domains[0];
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("mixed");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, domainId: domain.id, count, difficulty, topic: topic || undefined }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || `Failed (${res.status})`);
      else { setResult(data); router.refresh(); }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`${card} max-w-2xl space-y-4`}>
      {!configured && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          ANTHROPIC_API_KEY is not set, so generation will fail until it is added to the environment.
        </p>
      )}
      <label className="block space-y-1">
        <span className={label}>Exam</span>
        <select value={examId} onChange={(e) => { setExamId(e.target.value); setDomainId(exams.find((x) => x.id === e.target.value)!.domains[0].id); setTopic(""); }} className={input}>
          {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </label>
      <label className="block space-y-1">
        <span className={label}>Domain</span>
        <select value={domain.id} onChange={(e) => { setDomainId(e.target.value); setTopic(""); }} className={input}>
          {exam.domains.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.count} questions)</option>)}
        </select>
      </label>
      <label className="block space-y-1">
        <span className={label}>Objective</span>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className={input}>
          <option value="">All objectives in this domain</option>
          {domain.topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className={label}>Questions</span>
          <input type="number" min={1} max={maxPerRequest} value={count} onChange={(e) => setCount(Number(e.target.value))} className={input} />
        </label>
        <label className="block space-y-1">
          <span className={label}>Difficulty</span>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={input}>
            {["mixed", "easy", "medium", "hard"].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>
      <button type="button" onClick={run} disabled={busy} className={btnPrimary}>{busy ? "Generating (this can take a minute)..." : "Generate questions"}</button>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      {result && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Added {result.added} of {result.requested}. {result.skipped.length ? `Skipped ${result.skipped.length} (${[...new Set(result.skipped)].join(", ")}). ` : ""}
          The domain now has {result.total} questions.
        </p>
      )}
    </div>
  );
}
