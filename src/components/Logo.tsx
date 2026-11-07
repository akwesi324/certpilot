/**
 * CertPilot Brand Mark:
 * A cybersecurity shield combined with an ascending pilot delta flight vector
 * and certification pass trajectory.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cp-mark-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
        <linearGradient id="cp-mark-shield" x1="16" y1="5.5" x2="16" y2="26.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="cp-mark-check" x1="11" y1="18.2" x2="22" y2="13.2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Squircle App Base */}
      <rect width="32" height="32" rx="8" fill="url(#cp-mark-bg)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1" />

      {/* Cybersecurity Shield */}
      <path
        d="M16 5.5L24.5 9V15.5C24.5 20.8 20.8 24.8 16 26.5C11.2 24.8 7.5 20.8 7.5 15.5V9L16 5.5Z"
        fill="#1E1B4B"
        fillOpacity="0.4"
        stroke="url(#cp-mark-shield)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Pilot Delta Craft - Left Facet */}
      <path d="M16 8.2L10.2 17.2L16 15.2V8.2Z" fill="#FFFFFF" fillOpacity="0.95" />

      {/* Pilot Delta Craft - Right Facet (Aero Depth) */}
      <path d="M16 8.2L21.8 17.2L16 15.2V8.2Z" fill="#E0E7FF" fillOpacity="0.75" />

      {/* Dynamic Certification Checkmark (Pass Trajectory) */}
      <path
        d="M11 18.2L14.6 21.8L22 13.2"
        stroke="url(#cp-mark-check)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        Cert<span className="text-indigo-600 dark:text-indigo-400">Pilot</span>
      </span>
    </span>
  );
}
