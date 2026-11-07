# CertPilot

A study partner for cybersecurity certification exams. Pick the exam you are preparing for, practise each domain with explanations for every answer, and sit full timed simulations under real exam conditions until you are consistently scoring above the **80% pass mark**.

## Exams

| Vendor | Exam | Simulation |
|---|---|---|
| CompTIA | Security+ (SY0-701) | 90 questions, 90 min |
| CompTIA | CySA+ (CS0-003) | 85 questions, 165 min |
| CompTIA | PenTest+ (PT0-003) | 90 questions, 165 min |
| EC-Council | CEH (312-50) | 125 questions, 240 min |
| EC-Council | CHFI (312-49) | 150 questions, 240 min |
| ISC2 | Certified in Cybersecurity (CC) | 100 questions, 120 min |
| ISC2 | CISSP | 125 questions, 180 min |

Each exam is broken into the vendor's published domains and weightings.

## Features

- **Practice mode**: untimed sets, filtered by domain. After each answer you see the correct option and why every option is right or wrong.
- **Simulation mode**: the real question count and time limit, questions weighted by domain like the real exam, no feedback until you submit, flag-for-review, and a server-enforced timer (an overdue test is submitted automatically).
- **Scoring**: every test is marked against 80%, with a per-domain breakdown and a "focus next on" list.
- **Readiness dashboard**: accuracy per domain from your recent answers, last simulation score and a countdown to your exam date.
- **Retake anytime**: practice and simulations can be repeated; questions you have seen least are picked first, and answer options are shuffled every attempt.
- **History** of every test with a full answer review.

## Content

Practice questions are original and written against each vendor's **public exam objectives**. CertPilot does not use real exam questions or copyrighted course material, and is not affiliated with CompTIA, EC-Council or ISC2.

## Tech stack

Next.js 16 (App Router, TypeScript), Tailwind CSS, PostgreSQL with Prisma, Auth.js (credentials), Zod.

## Getting started

Requirements: Node.js 20+ and PostgreSQL.

```bash
npm install
cp .env.example .env        # set DATABASE_URL and AUTH_SECRET
npm run db:migrate          # create the tables
npm run db:seed             # load the starter question bank
npm run dev
```

Open http://localhost:3000, create an account and choose your exam.

## Security

- Passwords hashed with bcrypt; sign-in throttled per account and per IP (stored in the database, so it works across instances).
- Every query is scoped to the signed-in user; correct answers are never sent to the browser before they may be shown.
- Security headers (clickjacking protection, nosniff, HSTS, referrer and permissions policies).

## Question bank

The starter bank covers Security+ and ISC2 CC. To grow it for any exam:

1. Add an Anthropic API key (`ANTHROPIC_API_KEY`) and your email to `ADMIN_EMAILS` in `.env`.
2. Sign in and open **Question bank** (`/admin/generate`).
3. Pick an exam, domain, objective, difficulty and count (up to 15 per run).

Questions are written against the domain's objectives, checked (four distinct options, an explanation for each, a valid objective) and deduplicated before they are stored. Each domain is capped (`QUESTIONS_PER_DOMAIN_CAP`, default 300). The endpoint is `POST /api/generate` and is admin-only.

## Video lessons

- After each practice answer: a lesson link for that question's objective.
- Dashboard: click a domain to watch lessons for it.
- Results: free lessons for every domain below 80%, including searches for your institution if you set one.

## Deploying (Vercel + Neon)

1. Create a free PostgreSQL database at [neon.tech](https://neon.tech) and copy its connection string.
2. Load the schema and starter questions into it:
   ```bash
   DATABASE_URL="<neon url>" npm run db:deploy
   DATABASE_URL="<neon url>" npm run db:seed
   ```
3. Import this repository at [vercel.com/new](https://vercel.com/new) and set the environment variables `DATABASE_URL`, `AUTH_SECRET` (`openssl rand -base64 32`), `ANTHROPIC_API_KEY` and `ADMIN_EMAILS`.
4. Deploy. Vercel runs `npm install` (which generates the Prisma client) and `next build`.

## Android app

`android/` contains a lightweight native app that opens CertPilot in a secure WebView, keeps you signed in, and opens outside links in the browser. It builds without Gradle or Android Studio (JDK 21 and Android SDK build-tools 35 required):

```powershell
powershell -ExecutionPolicy Bypass -File .\android\build-apk.ps1 -ServerUrl https://your-app.vercel.app
```

The APK is written to `android/dist/`. Without `-ServerUrl` the app asks for the server address on first launch (an `http://` address is accepted only for a computer on your local network, for testing).

## Testing

With the app running on port 3001:

```bash
npm run test:e2e
```

This drives a real browser through sign-up, exam setup, a practice set, a timed simulation (including automatic submission when time runs out) and the history page.

---

&copy; MaskedOps 2026
