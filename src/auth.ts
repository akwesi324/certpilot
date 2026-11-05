import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clearFailures, clientIp, lockedUntil, recordFailure } from "@/lib/throttle";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

/** Thrown while an email or IP is locked out after too many failed sign-ins. */
export class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

const MAX_PER_EMAIL = 5;  // failed attempts per account per 15 minutes
const MAX_PER_IP = 30;    // failed attempts per IP address per 15 minutes

// Compared against when the email is unknown, so a missing account takes as long as a wrong
// password (no account enumeration by timing).
const DUMMY_HASH = bcrypt.hashSync("ledgerly-timing-equalizer", 12);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const emailKey = `email:${email}`;
        const ipKey = `ip:${clientIp(request?.headers)}`;

        if ((await lockedUntil(emailKey)) || (await lockedUntil(ipKey))) throw new TooManyAttempts();

        const user = await prisma.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) {
          await Promise.all([recordFailure(emailKey, MAX_PER_EMAIL), recordFailure(ipKey, MAX_PER_IP)]);
          return null;
        }

        await clearFailures(emailKey);
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
