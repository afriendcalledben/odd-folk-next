# Odd Folk

A peer-to-peer rental marketplace for event furniture and decorative props in London. Built with Next.js 16 (App Router), TypeScript, Prisma, Supabase (PostgreSQL), Stripe, and Tailwind CSS v4.

## Tech Stack

- **Framework:** Next.js 16 with App Router (`/src/app`)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 with custom brand theme in `globals.css`
- **Database:** PostgreSQL via Supabase, using Prisma 7 ORM
- **Auth:** Better Auth (self-hosted, sessions in PostgreSQL) — NOT Supabase Auth
- **Payments:** Stripe (two-sided marketplace with Connect)
- **Email:** Resend + React Email (`src/lib/email.ts`, `src/emails/`)
- **Package manager:** npm
- **Icons:** Lucide React
- **Notifications:** react-hot-toast

## Project Structure

```
src/
├── app/                    # App Router pages and API routes
│   ├── (main)/             # Main layout group
│   │   ├── (auth)/         # Protected routes (dashboard, list-item, welcome)
│   │   └── ...             # Public routes (products, users, faq, etc.)
│   ├── api/                # API route handlers
│   └── login/              # Login page + server actions
├── components/             # React components (organised by feature)
│   ├── auth/               # LoginForm, WelcomeForm
│   └── ui/                 # Input, Textarea, Select, Button (exported via index.ts)
├── context/                # React Context providers (AuthContext)
├── emails/                 # React Email templates (BookingRequestEmail, BookingStatusEmail)
├── services/               # API client (services/api.ts)
├── lib/                    # Server utilities (prisma, auth, api-response, email)
└── types.ts                # Shared TypeScript type definitions
```

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npx prisma generate` — Regenerate Prisma client after schema changes
- `npx prisma db push` — Push schema changes to database

## Code Style & Conventions

- **Be concise and pragmatic.** Minimal comments, no over-engineering, lean code.
- **Components:** PascalCase filenames. Group related components in feature folders under `/src/components/` (e.g., `/src/components/bookings/`).
- **Client components:** Use `'use client'` directive only when the component needs interactivity or hooks.
- **API routes:** Always use the helpers from `lib/api-response.ts` (`successResponse`, `errorResponse`) for consistent response formatting.
- **Auth on API routes:** Use `requireAuth()` or `getAuthUser()` from `lib/auth.ts` for protected endpoints.
- **Prisma:** Use the singleton client from `lib/prisma.ts`. Never instantiate `PrismaClient` directly.
- **Styling:** Use Tailwind utility classes. Custom theme colours use `--color-brand-*` CSS variables. Fonts: "Archivo Black" for headings, "Inter" for body text.
- **Types:** Define shared types in `types.ts`. Use TypeScript's strict mode — avoid `any`.

## API Response Format

All API endpoints must return consistent JSON:

```ts
// Success
successResponse(data, status?)   // { success: true, ...data }

// Error
errorResponse(message, status?)  // { success: true, error: "message" }
```

## Environment Variables

Key variables in `.env.local`:

- `DATABASE_URL` — Supabase pooled connection string
- `DIRECT_URL` — Direct PostgreSQL connection (for migrations)
- `BETTER_AUTH_SECRET` — Random 32+ char string for session signing
- `BETTER_AUTH_URL` — Full site URL (e.g. `https://oddfolk.co.uk`) — used by Better Auth for callbacks and by email templates for links/logo
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` — Facebook OAuth
- `RESEND_API_KEY` — Resend transactional email API key (emails silently skipped if absent)
- `UPLOAD_DIR` — File upload directory

**Do NOT set `NEXT_PUBLIC_SITE_URL`** — conflicts with Better Auth client baseURL config.

## Git

Do not create git commits unless explicitly asked.

## Key Patterns

- **Auth flow:** Login/signup via Better Auth. `src/components/auth/LoginForm.tsx` calls `signIn`/`signUp` from `lib/auth-client.ts` directly. Sessions stored in PostgreSQL, cookie-based. API routes authenticate via `requireAuth(req)` in `lib/auth.ts`.
- **Protected routes:** Wrapped in the `(auth)` layout group. Middleware at `middleware.ts` handles session refresh and redirects.
- **State management:** React Context (`AuthContext`) for auth state and user favourites. No external state library.
- **Database IDs:** UUIDs throughout.
- **Images:** Configured for remote patterns (`i.pravatar.cc`, `picsum.photos`) in `next.config.ts`.
