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

## Roadmap

- Generated question banks for every domain
- Video lessons per objective
- Android app

---

&copy; MaskedOps 2026
