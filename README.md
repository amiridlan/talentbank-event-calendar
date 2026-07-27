# Talentbank Event Calendar

A standalone full-year event calendar for career fairs with a back-office CMS for non-technical staff to manage events without touching code.

## Project Overview

This project provides:

- Public-facing calendar for browsing career fairs across Malaysia
- Admin CMS for event management (create, edit, move, cancel events)
- Registration system for candidates and employers
- Clash detection and capacity management
- Calendar exports (.ics, webcal feeds)

See [`docs/PROJECT_BRIEF.md`](./docs/PROJECT_BRIEF.md) for full project details and sprint plan.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** PostgreSQL (Neon serverless) + Drizzle ORM
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Auth:** Auth.js v5 (Google SSO)
- **Testing:** Vitest + Playwright
- **Email:** Resend + React Email
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- A Neon Postgres account (free tier works)

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Database

#### Create a Neon Project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up or log in
3. Click "New Project"
4. Name it "talentbank-event-calendar"
5. Select region closest to your deployment (Singapore for Asia/Kuala_Lumpur timezone)
6. Copy the connection string

#### Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Neon connection string:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

#### Push Schema to Database

```bash
npm run db:push
```

This creates the initial database schema (actual event tables will be added in Sprint 1).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run unit/component tests (Vitest)
npm run test:ui          # Vitest UI
npm run test:coverage    # Test coverage
npm run test:e2e         # Run e2e tests (Playwright)
npm run test:e2e:ui      # Playwright UI
npm run test:e2e:debug   # Debug Playwright tests

# Database
npm run db:generate      # Generate migration files
npm run db:migrate       # Run migrations
npm run db:push          # Push schema changes directly (dev only)
npm run db:studio        # Open Drizzle Studio (database GUI)
```

## Project Structure

```
talentbank-event-calendar/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (to be added)
│   ├── db/
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   └── index.ts      # Database connection
│   └── test/             # Test utilities
├── e2e/                  # Playwright e2e tests
├── docs/                 # Project documentation
│   ├── PROJECT_BRIEF.md  # Full project specification
│   └── raw-source-data.json # Seed data for Sprint 1
├── drizzle/              # Generated migrations
└── public/               # Static assets
```

## Sprint Status

**Current Sprint:** Sprint 0 - Groundwork (In Progress)

- [x] Next.js scaffold with TypeScript
- [x] ESLint + Prettier configuration
- [x] Vitest + Playwright test harness
- [x] Neon Postgres project provisioned
- [x] Drizzle ORM setup
- [ ] GitHub Actions CI
- [ ] Vercel preview deploys
- [ ] Hello-world deployment verification

**Next:** Sprint 1 - Model & Seed (31 events, cleaned data, typed API)

## Environment Variables

See `.env.example` for all required environment variables. Only `DATABASE_URL` is needed for Sprint 0.

## Contributing

This is a private project. See the sprint plan in `docs/PROJECT_BRIEF.md` for development roadmap.

## License

Proprietary
