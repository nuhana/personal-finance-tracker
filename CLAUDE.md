# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # also runs `prisma generate` (postinstall)
npm run dev              # Next.js dev server on http://localhost:3000
npm run build            # runs `prisma migrate deploy` then `next build` (needs a reachable DATABASE_URL)
npm start                # serve the production build
npm run lint             # eslint .
npx prisma migrate dev --name <name>   # create/apply a migration after editing prisma/schema.prisma
npx prisma db seed       # runs prisma/seed.ts via tsx (demo user + "Main Wallet" account)
npx prisma studio        # browse the database
```

There is no test suite. Environment variables (`.env`): `DATABASE_URL` (PostgreSQL), `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, plus AI keys `GEMINI_API_KEY` / `GROQ_API_KEY` (at least one) and optional `AI_PROVIDERS` (fallback order, default `groq,gemini`). AI calls go through `generateJson()` in `lib/ai/index.ts`, which tries each configured provider in `lib/ai/providers/` in order; routes should not call an AI SDK directly. Deployed on Vercel (`.vercel/`). Production env vars live in `.env.production.local` (git-ignored); `dotenv-cli` is installed to run commands against it, e.g. `npx dotenv -e .env.production.local -- prisma migrate deploy`. The README mentions `.env.example`, but that file does not exist.

Lint caveat: ESLint 9 is installed but config lives in the legacy-format `.eslint.json` (no `eslint.config.*` flat config), so `npm run lint` may not pick it up.

## Architecture

Next.js 14 App Router + Prisma/PostgreSQL. Data flow is strictly:

client component → React Query (`useQuery`/`useMutation`) → fetch helper in `lib/api/*.ts` → REST route in `app/api/**/route.ts` → `prisma` singleton (`lib/prisma.ts`) → PostgreSQL.

- **Pages** under `app/(dashboard)/` share the sidebar layout; `/` redirects to `/dashboard`. Pages are thin and compose client components from `components/<feature>/`.
- **`lib/api/*.ts`** holds the client-side fetch functions and hand-written DTO types (`WalletDto`, `TransactionDto`, …). Prisma `Decimal` fields arrive as **strings** in JSON (e.g. `balance`, `amount`), so DTOs type them as `string`. Keep DTOs in sync when changing route responses.
- **React Query keys** in use: `["wallet"]`, `["transactions"]`, `["analytics", "monthly"]`. Mutations must invalidate every key whose data they affect (e.g. adding a transaction invalidates `transactions` and `wallet`; analytics is currently not invalidated).
- **Route caching:** a `GET()` handler that doesn't read the request is rendered statically at build time in Next.js 14, so production serves a frozen response. Database-backed GET routes must `export const dynamic = "force-dynamic";`.
- **`QueryProvider`** (`components/providers/query-provider.tsx`) wraps the app in the root layout.

### Auth / current user

Authentication is not implemented. `getCurrentUserId()` in `lib/current-user.ts` returns the hard-coded demo user ID `cmi5zz74k00007q4skczcm7ad`, which is the same ID `prisma/seed.ts` creates. API routes should call `getCurrentUserId()` rather than hard-coding the ID (`app/api/accounts/route.ts` still hard-codes it). `lib/auth.ts` and `app/api/auth/[...nextauth]/route.ts` are placeholders for the planned NextAuth integration.

### Domain model (`prisma/schema.prisma`)

- `User` → `Account`, `Category`, `Transaction`, `Budget`, all scoped by `userId`.
- The "wallet" is simply the user's first `Account` (`findFirst({ where: { userId } })`); `Account.balance` is the wallet balance.
- `Transaction.amount` is **signed**: income positive, expense negative. There is no type column on `Transaction`; income/expense is derived from the sign (see `app/api/analytics/monthly/route.ts`). `POST /api/transactions` accepts `{ type, amount }`, signs the amount, and creates the transaction **and** increments `Account.balance` inside one `prisma.$transaction`. Any new code that creates, edits, or deletes transactions must keep the balance consistent in the same way.
- `Budget` is unique per `(userId, categoryId, month, year)`.

### Stubbed / in-progress

`app/api/categories`, `app/api/budgets`, and `app/api/transactions/[id]` (PATCH/DELETE) return placeholder responses. The budgets, categories, and settings pages are not yet wired up.

## UI conventions

- Tailwind CSS v4 (via `@tailwindcss/postcss`) + shadcn/ui components in `components/ui/`. The shadcn style is `base-vega`, built on **`@base-ui/react`**, not Radix, so composition uses the `render` prop (e.g. `<DialogTrigger render={<Button />} />`) rather than `asChild`. (`@radix-ui/react-label` and `@radix-ui/react-slot` are still in `package.json` but unused; don't reach for them.)
- Use `cn()` from `lib/utils.ts` for class merging; import paths use the `@/` alias.
- Prettier: double quotes, semicolons, `trailingComma: "es5"`.
