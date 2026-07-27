Copy everything below the line into your first message to Claude in the VS Code extension, with this folder (`E:\Development\talentbank-event-calendar`) open as the workspace.

---

We're building a full-year event calendar for career fairs (Talentbank-style), with a back office non-technical staff can use to add, edit, or move event dates without touching code. It needs to handle three real-world scenarios: events clashing, events getting cancelled/postponed, and events filling up — this is a planning tool people build their week around, not a passive listing.

Full context, source-data findings, scope decisions, tech stack with justification, domain design, and the sprint-by-sprint plan are written up in [`docs/PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) — **read that file in full before doing anything else.** The cleaned-vs-raw seed dataset (31 real events, with documented defects to fix) is at [`docs/raw-source-data.json`](./raw-source-data.json).

Key things already decided, so don't re-litigate them:

- Standalone project — no integration with the live talentbank.io site or its API at runtime; the raw data file is a one-time seed only.
- Full registration in scope for every event type, no carve-outs.
- Stack: Next.js 15 (App Router) + TypeScript, Postgres (Neon) + Drizzle, Auth.js (Google SSO), Tailwind + shadcn/ui, dnd-kit for the admin drag-to-move calendar, Zod, Resend, Playwright/Vitest, Vercel hosting. Reasoning for each choice is in the brief — Postgres in particular is chosen specifically for `daterange` + `btree_gist` exclusion constraints to enforce hard venue-clash prevention at the database level.
- 7-sprint plan (0 through 6), 2-week sprints. We are starting at **Sprint 0**.

Please start Sprint 0: scaffold the Next.js 15 + TypeScript project in this folder, set up ESLint/Prettier/Vitest/Playwright, provision Neon Postgres, wire up GitHub Actions CI, and get a hello-world deploying cleanly to a Vercel preview. Don't move into Sprint 1 (data modelling/seeding) until Sprint 0 is confirmed working — check in with me before moving on.
