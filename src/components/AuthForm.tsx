"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type FormState } from "@/app/actions/auth";
import { btnPrimary, card, input, label } from "@/lib/ui";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : register, undefined);
  const isLogin = mode === "login";
  return (
    <form action={action} className={`${card} w-full max-w-sm space-y-4`}>
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isLogin ? "Sign in to continue studying." : "Start practising for your certification."}
        </p>
      </div>
      {!isLogin && (
        <label className="block space-y-1">
          <span className={label}>Name</span>
          <input name="name" required maxLength={80} autoComplete="name" className={input} />
        </label>
      )}
      <label className="block space-y-1">
        <span className={label}>Email</span>
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className="block space-y-1">
        <span className={label}>Password</span>
        <input name="password" type="password" required minLength={8} autoComplete={isLogin ? "current-password" : "new-password"} className={input} />
      </label>
      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
