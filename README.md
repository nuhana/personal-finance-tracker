# Personal Finance Tracker (Full‑Stack)

A clean, modern finance tracker built with **Next.js + TypeScript + Prisma + Tailwind**.
Track expenses, income, accounts, categories, and budgets with a dashboard.

## Stack
- Next.js (App Router), React, TypeScript, TailwindCSS
- PostgreSQL + Prisma ORM
- NextAuth (auth)
- Recharts (charts)

## Quick Start
1) Install deps
```bash
npm install
```
2) Configure env
```bash
cp .env.example .env
# Update DATABASE_URL if needed
```
3) Setup DB
```bash
npx prisma migrate dev --name init
```
4) Run the app
```bash
npm run dev
```
Open http://localhost:3000

## Next Steps
- Implement API route handlers using Prisma (`lib/prisma.ts`).
- Build Transactions CRUD UI with forms and a table.
- Create analytics endpoint `/api/analytics/summary` and connect Recharts.
- Add NextAuth providers and protect routes.
