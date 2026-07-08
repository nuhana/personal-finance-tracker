# Personal Finance Tracker

A modern full-stack personal finance tracker built to demonstrate production-ready React and Next.js development.

The application allows users to manage their personal finances by tracking wallet balance, income, expenses, budgets and spending analytics through a clean dashboard interface.

---

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

### In Progress

- Add Transaction dialog
- Income & Expense tracking
- Categories
- Budgets
- Analytics charts

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
├── api/
│   ├── wallet
│   └── transactions
│
components/
├── Wallet
├── Transactions
├── ui
│
lib/
├── api
├── prisma.ts
└── current-user.ts

prisma/
└── schema.prisma
```

---

## Getting Started

Install dependencies

```bash
npm install
```

Configure environment variables

```bash
cp .env.example .env
```

Run database migrations

```bash
npx prisma migrate dev
```

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

