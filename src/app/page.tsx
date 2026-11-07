import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { CATEGORY, EXAMS, PASS_MARK, examsByVendor } from "@/lib/exams";
import { btnPrimary, btnSecondary, card } from "@/lib/ui";

export const dynamic = "force-dynamic";

const FEATURES = [
  { title: "Practice by domain", body: "Short sets on the areas you choose, with an explanation for every option straight after each question." },
  { title: "Real exam simulations", body: "The real question count and time limit, weighted like the official exam, with no feedback until you submit." },
  { title: `Scored against ${PASS_MARK}%`, body: "Every test is marked against an 80% pass mark and broken down by domain, so you know exactly what to revise." },
  { title: "Retake anytime", body: "Practice and simulations can be repeated as often as you like; you see the questions you have answered least first." },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex gap-2">
          <Link href="/login" className={btnSecondary}>Sign in</Link>
          <Link href="/register" className={btnPrimary}>Get started</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        <section className="py-14 text-center sm:py-20">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Your study partner for cybersecurity certifications
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Tell CertPilot which exam you are preparing for. Practise each domain, understand every answer, and sit full simulations under real exam conditions until you are consistently passing.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register" className={`${btnPrimary} px-6 py-3 text-base`}>Start preparing</Link>
            <Link href="/login" className={`${btnSecondary} px-6 py-3 text-base`}>I have an account</Link>
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className={card}>
              <h2 className="font-semibold text-slate-900 dark:text-white">{f.title}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.body}</p>
            </div>
          ))}
        </section>
        <section className="py-12">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {CATEGORY} exams covered &middot; {EXAMS.length}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examsByVendor().map(({ vendor, exams }) => (
              <div key={vendor.name} className={card}>
                <h3 className="font-semibold text-slate-900 dark:text-white">{vendor.fullName}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{exams.map((e) => e.code).join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
