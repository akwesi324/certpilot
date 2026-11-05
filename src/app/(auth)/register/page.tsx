import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
        <Link href="/" aria-label="CertPilot home">
          <Logo />
        </Link>
        <AuthForm mode="register" />
      </main>
      <Footer />
    </div>
  );
}
