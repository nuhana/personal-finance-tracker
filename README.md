# Personal Finance Tracker

A modern full-stack personal finance tracker built to demonstrate production-ready React and Next.js development.

The application allows users to manage their personal finances by tracking wallet balance, income, expenses, budgets and spending analytics through a clean dashboard interface.

---

## Screenshots

<img width="1876" height="872" alt="Screenshot 2026-07-14 132034" src="https://github.com/user-attachments/assets/f5c13067-f741-46a6-8e09-8d340ac1d532" />

<img width="1873" height="858" alt="Screenshot 2026-07-14 132054" src="https://github.com/user-attachments/assets/c2bf4ace-adde-4d77-a5f7-57e36139604f" />


## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack React Query
- Recharts

### Backend
- Next.js API Routes (REST)
- Prisma ORM
- PostgreSQL

### AI
- Google Gemini (`@google/genai`)

### Authentication
- NextAuth (planned)

---

## Features

### Implemented

- Wallet dashboard
- Transactions API
- Wallet API
- PostgreSQL database
- Prisma ORM
- REST API architecture
- React Query data fetching
- Responsive dashboard layout
- Transaction list
- Wallet balance
- Add Transaction dialog (income & expense, wallet balance updated automatically)
- Monthly cash flow chart on the dashboard
- AI category suggestions: a "Suggest" button in the Add Transaction dialog asks Gemini to pick one of your categories from the transaction note

### In Progress

- Categories (demo categories are seeded; the categories API and page are not wired up yet)
- Budgets
- Editing and deleting transactions

### Planned

- Authentication with NextAuth
- Recurring transactions
- Search & filtering
- User settings
- Dark mode

---

## Project Structure

```
app/
├── (dashboard)/        # pages sharing the sidebar layout
│   ├── dashboard
│   ├── wallet
│   ├── transactions
│   ├── categories
│   ├── budgets
│   └── settings
└── api/
    ├── wallet
    ├── transactions
    ├── analytics/monthly
    ├── ai/categorize
    ├── accounts
    ├── categories
    └── budgets

components/
├── analytics
├── dashboard
├── layout
├── providers
├── transactions
├── wallet
└── ui                  # shadcn/ui components

lib/
├── api                 # client-side fetch helpers and DTO types
├── prisma.ts
└── current-user.ts

prisma/
├── schema.prisma
└── seed.ts
```

---

## API

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/wallet` | The current user's wallet and balance |
| GET | `/api/transactions` | All transactions, newest first |
| POST | `/api/transactions` | Create a transaction `{ type, amount, date?, note?, categoryId? }` and update the wallet balance |
| GET | `/api/analytics/monthly` | Monthly income and expense totals |
| POST | `/api/ai/categorize` | Suggest a category for `{ note, type? }`; returns `{ categoryId, categoryName }` |
| GET | `/api/accounts` | The current user's accounts |

`/api/categories`, `/api/budgets` and `PATCH`/`DELETE /api/transactions/[id]` currently return placeholder responses.

---

## Getting Started

Install dependencies

```bash
npm install
```

Configure environment variables in a `.env` file

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/finance_tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-string"
GEMINI_API_KEY="your-gemini-api-key"   # from https://aistudio.google.com/apikey
```

Run database migrations

```bash
npx prisma migrate dev
```

Seed the database (creates the demo user, a "Main Wallet" account and demo categories)

```bash
npx prisma db seed
```

> Authentication is not implemented yet; the app always runs as the seeded demo user.
>
> Gemini's free tier allows 20 requests per day, so AI suggestions only run when you click "Suggest".

Start the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Architecture

Frontend Components

↓

React Query

↓

REST API (`/api/...`)

↓

Prisma ORM

↓

PostgreSQL

---

## Goals

This project is being built as a production-style portfolio application focusing on:

- Clean architecture
- Reusable components
- Type safety
- Modern React patterns
- Scalable backend design
- Full-stack development with Next.js

