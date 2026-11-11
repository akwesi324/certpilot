import { PASS_MARK } from "@/lib/exams";

/** A labelled percentage bar, green at or above the pass mark, amber below, grey with no data. */
export default function DomainBar({
  name,
  percent,
  detail,
  href,
}: {
  name: string;
  percent: number | null;
  detail?: string;
  href?: string;
}) {
  const color =
    percent === null
      ? "bg-slate-300 dark:bg-slate-700"
      : percent >= PASS_MARK
      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
      : percent >= 60
      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
      : "bg-gradient-to-r from-rose-500 to-red-400";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title="Watch lessons for this domain"
            className="font-medium text-slate-800 hover:text-violet-600 hover:underline dark:text-slate-200 dark:hover:text-violet-400"
          >
            {name} <span aria-hidden="true">&#9655;</span>
          </a>
        ) : (
          <span className="font-medium text-slate-800 dark:text-slate-200">{name}</span>
        )}
        <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
          {percent === null ? "no answers yet" : `${percent}%`}
          {detail ? ` · ${detail}` : ""}
        </span>
      </div>
      <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${percent ?? 0}%` }} />
        <div
          className="absolute inset-y-0 w-px bg-slate-900/40 dark:bg-white/50"
          style={{ left: `${PASS_MARK}%` }}
          title={`Pass mark ${PASS_MARK}%`}
        />
      </div>
    </div>
  );
}
