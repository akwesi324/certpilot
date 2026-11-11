"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/exams", label: "Exams" },
  { href: "/history", label: "History" },
];

export default function NavLinks({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname();
  const links = admin ? [...LINKS, { href: "/admin/generate", label: "Question bank" }] : LINKS;
  return (
    <nav className="order-last -mx-1 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
