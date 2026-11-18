"use client";

import type { DemoAccount } from "@/lib/demo";

/** Fills the sign-in form on this page with a demo account. Rendered only when DEMO_LOGINS is set. */
export default function DemoLogin({ accounts }: { accounts: DemoAccount[] }) {
  if (accounts.length === 0) return null;
  const fill = (a: DemoAccount) => {
    const set = (name: string, value: string) => {
      const el = document.querySelector<HTMLInputElement>(`form input[name="${name}"]`);
      if (el) el.value = value;
    };
    set("email", a.email);
    set("password", a.password);
    document.querySelector<HTMLButtonElement>('form button[type="submit"]')?.focus();
  };
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
      <span className="text-slate-500 dark:text-slate-400">Just looking?</span>
      {accounts.map((a) => (
        <button
          key={a.email}
          type="button"
          onClick={() => fill(a)}
          className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Use demo account{accounts.length > 1 ? `: ${a.label}` : ""}
        </button>
      ))}
    </div>
  );
}
