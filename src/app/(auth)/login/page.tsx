import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import DemoLogin from "@/components/DemoLogin";
import { demoAccounts } from "@/lib/demo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
        <Link href="/" aria-label="CertPilot home">
          <Logo />
        </Link>
        <div className="w-full max-w-sm space-y-3">
          <AuthForm mode="login" />
          <DemoLogin accounts={demoAccounts()} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
