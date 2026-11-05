export default function Footer() {
  return (
    <footer className="mt-auto px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
      &copy; MaskedOps {new Date().getFullYear()} &middot; Practice questions are original and written against public exam
      objectives. CertPilot is not affiliated with CompTIA, EC-Council or ISC2.
    </footer>
  );
}
