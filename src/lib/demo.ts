export type DemoAccount = { label: string; email: string; password: string };

/**
 * Demo accounts offered on the sign-in page, from the DEMO_LOGINS environment variable:
 *   DEMO_LOGINS="Label|email|password;Another label|email|password"
 * Unset (the default) means no demo button. Keep these accounts free of real data.
 */
export function demoAccounts(raw = process.env.DEMO_LOGINS): DemoAccount[] {
  if (!raw) return [];
  return raw
    .split(";")
    .map((entry) => entry.split("|").map((s) => s.trim()))
    .filter((parts) => parts.length === 3 && parts.every(Boolean) && parts[1].includes("@"))
    .map(([label, email, password]) => ({ label, email, password }));
}
