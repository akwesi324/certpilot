/** CertPilot mark: a shield with a check, and the wordmark. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-indigo-600" />
      <path d="M16 6.5 8.5 9.4v5.9c0 4.7 3.2 8.6 7.5 10.2 4.3-1.6 7.5-5.5 7.5-10.2V9.4L16 6.5Z" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m12.4 15.8 2.6 2.6 4.8-5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">CertPilot</span>
    </span>
  );
}
