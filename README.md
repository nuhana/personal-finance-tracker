# Personal Finance Tracker

A full-stack personal finance tracker built with Next.js, Prisma and PostgreSQL. You can track your wallet balance, income and expenses, see monthly cash flow, and use two AI features: category suggestions and spending insights. Both are built so the AI can never invent a category or a number.

---

## Screenshots

<img width="1876" height="872" alt="Dashboard" src="https://github.com/user-attachments/assets/f5c13067-f741-46a6-8e09-8d340ac1d532" />

<img width="1873" height="858" alt="Transactions" src="https://github.com/user-attachments/assets/c2bf4ace-adde-4d77-a5f7-57e36139604f" />

---

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS v4, TanStack React Query, React Hook Form + Zod, Recharts |
| UI components | [shadcn/ui](https://ui.shadcn.com) (Button, Card, Dialog, Input, Label, Select, Textarea) with lucide-react icons |
| Backend | Next.js route handlers (REST), Prisma ORM, PostgreSQL (Neon in production) |
| AI | Groq and Google Gemini (`@google/genai`), tried in order with automatic fallback |
| Hosting | Vercel |
| Auth | NextAuth (planned) |

---

## Features

### Implemented

- **Wallet:** the current balance, updated automatically by every transaction
- **Transactions:** a list of all transactions, plus an Add Transaction dialog for income and expenses with form validation
- **Categories:** pick a category from a dropdown that only shows categories of the selected type (Income or Expense)
- **AI category suggestions:** **Suggest with AI** picks one of *your* categories from the transaction note. You can always change it or pick one yourself.
- **Monthly cash flow:** income vs. expenses per month, as a chart on the dashboard
- **AI spending insights:** a dashboard card compares this month's spending so far with the same days of last month, overall and per category, and has the AI summarize the changes

### In progress

- Editing and deleting transactions
- Budgets page
- Categories page (creating and managing categories)

### Planned

- Authentication with NextAuth
- Recurring transactions
- Search and filtering
- User settings
- Dark mode

---

## How It Works

### Data flow

Every feature follows the same path:

```
Client component
  → React Query (useQuery / useMutation)
  → fetch helper + DTO types in lib/api/*.ts
  → REST route in app/api/**/route.ts
  → Prisma client (lib/prisma.ts)
  → PostgreSQL
```

### Transactions and the wallet balance

- `Transaction.amount` is **signed**: income is positive, an expense is negative. There is no separate type column, so the type and the amount can never disagree.
- The client sends a type and a positive amount, and **the server applies the sign**.
- Creating a transaction and updating `Account.balance` happen in **one database transaction** (`prisma.$transaction`) using an atomic `increment`. Either both are saved or neither is, and requests that arrive at the same time can't overwrite each other.
- Money is stored as PostgreSQL `Decimal`, never as a float, and reaches the client as a string.
- If a category is given, the server checks that it belongs to the user and matches the transaction type.

### AI with guardrails

The AI only **chooses** and **phrases**. The app makes the decisions and does the maths.

**Category suggestions** (`POST /api/ai/categorize`)
- Only category **names** are sent to the model, never database IDs or other user data.
- A JSON schema limits the answer to the user's category names (or `null`).
- The server then checks the answer anyway: the name **and** the type must match a real category, and only then is it mapped back to an ID.
- If the user already chose Income or Expense, the AI never overrides that choice.

**Spending insights** (`POST /api/ai/insights`)
- `getSpendingStats()` computes every figure in code. It compares month-to-date spending with the *same elapsed time* of last month, so a half-finished month isn't compared with a whole one.
- The model gets only those precomputed facts (category names and totals) and turns them into sentences.
- Any sentence that contains a number not found in the facts is dropped. If the summary is dropped, the app writes its own.

**Providers** (`lib/ai/`)
- Routes call one function, `generateJson()`, never an AI SDK directly.
- Providers are tried in order (Groq first by default, then Gemini). The next provider is tried when one fails or is rate limited.
- AI features run only when the user clicks a button, to stay within rate limits. If every provider fails, the rest of the app keeps working and categories can still be picked by hand.

---

## Getting Started

### Requirements

- Node.js 18+
- A PostgreSQL database (local, or hosted, e.g. [Neon](https://neon.tech))
- At least one AI API key: [Groq](https://console.groq.com/keys) and/or [Gemini](https://aistudio.google.com/apikey)

### 1. Install dependencies

```bash
npm install
```

This also runs `prisma generate`.

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/finance_tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-string"

# At least one AI key is required for the AI features
GROQ_API_KEY="your-groq-api-key"
GEMINI_API_KEY="your-gemini-api-key"

# Optional
# AI_PROVIDERS="groq,gemini"         # order providers are tried in (default)
# GROQ_MODEL="openai/gpt-oss-20b"    # default Groq model
# GEMINI_MODEL="gemini-3.8-flash"    # default Gemini model
```

### 3. Set up the database

```bash
npx prisma migrate dev   # create the tables
npx prisma db seed       # demo user, "Main Wallet" account and demo categories
```

> Authentication is not implemented yet, so the app always runs as the seeded demo user.

### 4. Start the app

```bash
npm run dev
```

Open http://localhost:3000.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Apply migrations (`prisma migrate deploy`), then build the app |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev --name <name>` | Create and apply a migration after changing `prisma/schema.prisma` |
| `npx prisma db seed` | Seed the demo data |
| `npx prisma studio` | Browse the database |

---

## Deployment (Vercel)

1. Add the environment variables above in **Vercel → Settings → Environment Variables**, with `DATABASE_URL` pointing at your hosted database.
2. Deploy. The build command runs `prisma migrate deploy`, so **the database must be reachable during the build**. A `P1001: Can't reach database server` error means Vercel couldn't connect. Check the URL, and whether your database host allows connections from outside.

---

## API

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/wallet` | The current user's wallet and balance |
| GET | `/api/transactions` | All transactions, newest first |
| POST | `/api/transactions` | Create a transaction `{ type, amount, date?, note?, categoryId? }` and update the wallet balance |
| GET | `/api/categories` | The current user's categories, sorted by name |
| GET | `/api/analytics/monthly` | Monthly income and expense totals |
| POST | `/api/ai/categorize` | Suggest a category for `{ note, type? }`. Returns `{ type, categoryId, categoryName }` |
| POST | `/api/ai/insights` | Compare this month's spending so far with the same days of last month. Returns `{ summary, insights, stats }` |
| GET | `/api/accounts` | The current user's accounts |

`POST /api/categories`, `/api/budgets` and `PATCH`/`DELETE /api/transactions/[id]` currently return placeholder responses.

---

## Project Structure

```
app/
├── (dashboard)/        # pages that share the sidebar layout
│   ├── dashboard
│   ├── wallet
│   ├── transactions
│   ├── categories
│   ├── budgets
│   └── settings
└── api/
    ├── wallet
    ├── transactions
    ├── categories
    ├── analytics/monthly
    ├── ai/categorize
    ├── ai/insights
    ├── accounts
    └── budgets

components/
├── analytics
├── dashboard
├── layout
├── providers
├── transactions
├── wallet
└── ui                  # shadcn/ui components (added with the shadcn CLI)

lib/
├── ai/                 # generateJson() + Groq and Gemini providers
├── api/                # client-side fetch helpers and DTO types
├── insights.ts         # month-over-month spending stats
├── current-user.ts     # demo user until auth is added
└── prisma.ts           # shared Prisma client

prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

---

## Known Limitations

- No authentication yet; every request runs as the demo user.
- Transactions can't be edited or deleted yet.
- The monthly analytics chart isn't refreshed automatically after adding a transaction.
- There is no automated test suite yet.

---

## Goals

This is a production-style portfolio project that focuses on:

- Clean, predictable architecture
- Type safety from the database to the UI
- Data correctness (atomic balance updates, exact money values)
- Using AI responsibly: constrained, validated and optional
- Modern React patterns (React Query, React Hook Form, Zod)
