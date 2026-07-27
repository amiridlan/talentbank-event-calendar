# Talentbank Event Calendar — Project Brief

**Status:** Planning complete, Sprint 0 not yet started. Handed off from a planning session (Claude Code CLI) to implementation (Claude in VS Code).

**Repo:** `E:\Development\talentbank-event-calendar` (folder created, empty except `docs/`).

---

## 1. What we're building

A standalone full-year event calendar for career fairs, modelled on Talentbank's public calendar at `www.talentbank.io/career-fairs`, with a **back office a non-technical events-team person can use to add, edit, or move event dates without touching code.**

This is **not** an integration with the live talentbank.io site. We are not deploying to it, not replacing it, not consuming its live API at runtime. We only used its calendar data as a one-time seed/reference dataset. Once seeded, this project has no runtime dependency on talentbank.io or its backend.

The three scenarios the events team explicitly needs handled (from the original brief) are **clashes, cancellations, and events filling up** — this is a planning tool people build their week around, not a passive listing.

---

## 2. Source data findings (already done — don't redo this research)

The live talentbank.io page is static HTML that client-fetches `https://api.handbook.tips/talentbank-io/events` and renders a calendar grid. That endpoint was queried directly (via browser devtools `fetch`) and returned **31 events**, Aug 2026 → Jun 2027.

The raw, uncleaned response is saved at [`docs/raw-source-data.json`](./raw-source-data.json) — **use this as the Sprint 1 seed fixture**, not the schema to copy. It has real defects that must be fixed during modelling/import, not preserved:

1. **Multi-day events are stored as duplicate rows**, one per day, same name. 7 pairs need merging into single events with start/end dates:
   - Johor Premium Career Fair (2026-10-03 + 10-04)
   - IGNITE UTHM (2026-10-20 + 10-21)
   - UMT Career & Internship Fair (2026-10-23 + 10-24)
   - Sunway University Get Hired "Day 1"/"Day 2" (2026-10-27 + 10-28) — strip "(Day 1)"/"(Day 2)" from the name once merged
   - UPM Talent Fest (2026-11-11 + 11-12)
   - Talentbank Career Fair (2027-04-03 + 04-04)
   - National Career Fair / "National Career Fair ABC" (2027-06-26 + 06-27) — note the inconsistent name, treat as one event
2. **`type` values are inconsistent casing and include an undocumented value**: `"Campus"`, `"Sector"`, `"Public"`, and `"Awards"` (a Gala/Awards dinner, not a career fair — decide whether it belongs in this calendar at all, or gets its own `event_category`).
3. **Region values have stray whitespace / spelling inconsistencies**: `"Johor "` (trailing space), `"Melacca "` → should be Melaka, `"Terrengganu"` → should be Terengganu. Normalize to a fixed Malaysian-state enum.
4. **`fields` (subject/industry tags) are a free-text mess**, ~110 distinct strings across 31 events with duplicates-by-typo: `"Social Science"` vs `"Social Sciences"`, `"Applied Science"` vs `"Applied Sciences"`, `"Media & Communication"` vs `"Media and Communication"`, and typos like `"Couseling"`, `"Business Adminstration"`. Needs a controlled taxonomy with a mapping table from raw → canonical, not a straight import.
5. **No time-of-day and no venue address in the source data at all** — only a date. This is a real content gap: the events team will need to supply start/end time and venue per event; don't assume this appears for free during import.
6. **No status field** (cancelled/postponed/full) and **no capacity fields** at all in the source — this whole area is new modelling, not extracted from source.
7. Past events aren't retained anywhere upstream (the live page filters them out and never shows them again) — we want an archive, so don't mimic that filtering at the DB level, only at the "upcoming" query level.

**Already-live scheduling collisions in this same-day data** (useful for testing clash detection against real cases): Oct 3 (Tech Career Fair, Klang Valley + Johor Premium Day 1, Johor — different states, so a good test of "no false positive across regions"). Oct 21 (INTI Nilai + IGNITE UTHM Day 2, both technically Negeri Sembilan/Johor — different states again). Oct 27 (IIUM + Sunway Get Hired Day 1, **both Selangor** — this one should actually trigger a same-state soft-clash warning).

---

## 3. Scope decisions (already settled — do not re-litigate without checking with the user)

These were explicitly asked and answered:

- **Standalone project.** No integration with talentbank.io or api.handbook.tips at runtime. No deploy access to the live site is needed or wanted.
- **Registration is fully in scope**, for every event type, no carve-outs. Each event may optionally carry an external microsite URL (e.g. `utarcareerfair.com`) as a reference link, but our own registration flow is the primary path for all events, campus fairs included.
- **No cutover work, no contract-compatibility requirement** with the old API shape — we're free to model data properly rather than preserve `iso/name/type/region/fields`.

---

## 4. Domain design

### Clashes

Two distinct mechanisms:

- **Hard block**: same venue + overlapping dates → physically impossible, must be a **database-level exclusion constraint** (Postgres `daterange` + `btree_gist`), not just app-level validation, so it can't be raced or bypassed.
- **Soft warning**: same state + overlapping subject field + within a configurable window (e.g. 7 days) → warn the editor, show the conflicting event, allow proceeding with a **logged acknowledgement reason**. Do not hard-block this case — business users sometimes know better than the heuristic, and hard-blocking valid business decisions just pushes people back to a spreadsheet.

### Cancellations / postponements

Never delete an event record. Lifecycle: `draft → scheduled → {postponed | cancelled | completed}`.

- Cancelled events stay visible on the public calendar, struck through, with a reason, for a grace window (e.g. 30 days) rather than vanishing — people already planned around it.
- Postponement writes a `moved_from` reference so the UI can show "moved from 3 Oct."
- Keep a public-facing change history / audit trail per event.

### Filling up

Capacity is **two independent tracks**, not one number:

- Candidate seats
- Employer booths
  These fill at different rates and both matter (booths-remaining is a sales signal for the employer side, seats-remaining matters for candidates). States: `open → filling (≥80%) → full → waitlist`, with auto-promotion from waitlist when a spot opens.

### "Plan your week" — the actual differentiator

- Per-event `.ics` download.
- A **subscribable webcal feed**, filterable by state/field, so someone can put "all Selangor tech fairs" into their own calendar app and have date changes propagate automatically via iCal `SEQUENCE`/`UID` semantics.
- Change/cancellation/reminder emails.

---

## 5. Tech stack (decided, with reasoning — don't re-derive from scratch)

| Layer                      | Choice                                                                                     | Why                                                                                                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App framework              | **Next.js 15 (App Router) + TypeScript**                                                   | Single deployable for public calendar + admin CMS + API. Server-rendered calendar is indexable (unlike the live talentbank.io page, which is client-rendered and invisible to search engines today).                                                              |
| Database                   | **PostgreSQL (Neon serverless)**                                                           | Chosen specifically for `daterange` + `btree_gist` **exclusion constraints** — the actual mechanism for hard venue-clash prevention at the DB layer. SQLite can't do this; document stores make date-range logic worse, not better.                               |
| ORM                        | **Drizzle**                                                                                | SQL-first, no heavy query-engine binary, good cold-start behavior on serverless, and doesn't hide the range-type SQL this project specifically needs.                                                                                                             |
| Auth                       | **Auth.js v5** — Google Workspace SSO + email magic link, RBAC (`admin / editor / viewer`) | Events-team users likely already on Workspace; no self-managed passwords means no password-reset support burden for non-technical users.                                                                                                                          |
| UI                         | **Tailwind v4 + shadcn/ui (Radix primitives)**                                             | Accessible dialog/combobox/date-picker components out of the box; WCAG matters given the university/GLC-employer audience.                                                                                                                                        |
| Admin calendar interaction | **Custom month grid + `dnd-kit` + `@internationalized/date`**                              | The core admin verb is "drag an event card to a new day." `dnd-kit` supports keyboard-accessible drag, which most drag libraries don't. FullCalendar was considered and rejected: premium licensing + bundle weight for calendar views this project doesn't need. |
| Validation                 | **Zod**, shared across API routes, forms, and the seed/import script                       | One schema, multiple consumers, no drift.                                                                                                                                                                                                                         |
| Email                      | **Resend + React Email**                                                                   | Cancellation notices, waitlist promotion, date-change alerts.                                                                                                                                                                                                     |
| Time handling              | Store `timestamptz`, render in `Asia/Kuala_Lumpur` everywhere, test explicitly             | A fair on 3 Oct must never render as 2 Oct across environments — treat this as a correctness requirement, not a nice-to-have.                                                                                                                                     |
| Testing                    | **Vitest + Testing Library + Playwright**                                                  | Unit/component + e2e.                                                                                                                                                                                                                                             |
| Hosting                    | **Vercel + Neon**                                                                          | Preview deployment per PR — events-team stakeholders get a clickable URL before merge. Built-in cron for archiving jobs and reminder emails.                                                                                                                      |

**Considered and rejected:** Payload CMS 3 (would have supplied free admin UI + RBAC + audit log out of the box). Rejected because Payload's grain is a generic document-list CMS, and the actual primary admin interaction here is calendar-native (drag a date, see a clash warning inline) — a generic CMS fights that instead of expressing it. Revisit only if it turns out the events team's real daily need is authoring long-form event content rather than manipulating dates/capacity — flag this to the user if it comes up again.

---

## 6. Sprint plan

2 devs assumed, 2-week sprints, focus factor 0.7, ~80% of a 26-point velocity per sprint (Sprint 0 is a half-sprint). Sprint numbers and goals are fixed; story lists inside each sprint can flex during refinement.

| Sprint                             | Goal                                                                                                                                    | Pts | Key stories                                                                                                                                                                                                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0 — Groundwork**                 | Repo exists at `E:\Development\talentbank-event-calendar`, hello-world deploys green from CI.                                           | 8   | Next.js scaffold; TS/ESLint/Prettier; Vitest + Playwright harness wired into CI; Neon project provisioned; GitHub Actions; Vercel preview deploys                                                                                                                                         |
| **1 — Model & Seed**               | The real 31 events live in a properly modelled Postgres schema behind a typed read API — cleaned, not copied.                           | 21  | Schema + Drizzle migrations; one-time import script from `docs/raw-source-data.json`; merge the 7 multi-day pairs into date-range events; normalize region/type/field taxonomies (see section 2); `GET /api/events` with Zod-validated response                                           |
| **2 — Public Calendar**            | Anyone can browse the full year and filter to fairs relevant to them.                                                                   | 21  | Month-grouped calendar UI; filters (year, state, field, event type, audience); event detail pages; venue + time-of-day display (flag clearly when missing); responsive layout; `Event` JSON-LD structured data; accessibility baseline (keyboard nav, focus states, contrast)             |
| **3 — Admin CMS**                  | A non-technical coordinator can log in and create, edit, and move an event without a developer.                                         | 21  | Google SSO + RBAC; event list with search/filter; create/edit form with inline validation; **drag-to-move month grid** (keyboard-accessible); draft/publish workflow; audit log with undo                                                                                                 |
| **4 — Lifecycle**                  | The calendar tells the truth when plans change.                                                                                         | 21  | Postgres exclusion constraint for hard venue clashes; soft-clash warning engine (same state + overlapping field + date window) with logged acknowledgement; cancel-with-reason + public strikethrough + grace window; postpone with `moved_from` provenance; public-facing change history |
| **5 — Registration & Capacity**    | Candidates and employers can secure a place, and see when there isn't one.                                                              | 26  | Registration flow for all event types; dual capacity tracks (seats vs booths); full/waitlist states + auto-promotion; PDPA 2010 consent capture, retention policy, data-subject-access handling; optional external microsite reference link per event                                     |
| **6 — Plan Your Week + Hardening** | Someone can put a fair into their own calendar, get told when it moves, and the events team can run this without developer involvement. | 21  | Per-event `.ics` download; filtered webcal subscription feed; change/cancellation/reminder emails via Resend; past-events archive view; WCAG 2.2 AA audit; security review; admin runbook + walkthrough                                                                                   |

**Recommended specialist agents/skills per phase:** `system-design-architect` / `/system-design` for schema review in Sprint 1 · `fullstack-web-developer` for the build across Sprints 1–5 · `ui-ux-designer` / `/ux-designer` + `/ui-designer` for admin flows (Sprint 3) and public calendar (Sprint 2) · `qa-engineer` for test strategy (Sprint 1) and e2e coverage (Sprint 6) · `cybersecurity-specialist` for auth review (Sprint 3) and a pre-launch security pass (Sprint 6) · `devops-engineer` for CI/CD (Sprint 0, Sprint 6) · `/code-reviewer` at the close of every sprint · `/technical-writer` for the admin runbook (Sprint 6).

---

## 7. Open risks / things to watch

- **PDPA 2010 (Malaysian Personal Data Protection Act)** applies to registration data — consent, retention, and data-subject-access must be designed into Sprint 5, not retrofitted.
- **Time-of-day and venue address don't exist in the source data.** This is a content-collection task for the events team, not something the import script can produce. Surface this as a required-field nag in the admin UI rather than silently leaving it blank.
- **Timezone correctness** (`Asia/Kuala_Lumpur`) needs explicit test coverage — don't rely on default server timezone behavior.
- The **"Awards" type** (9th Graduates' Choice Award Gala) doesn't fit the `campus/sector/public` career-fair model cleanly — decide in Sprint 1 whether it's an event category of its own or out of scope for this calendar.

---

## 8. Immediate next step

Start **Sprint 0**: scaffold the Next.js 15 + TypeScript project inside `E:\Development\talentbank-event-calendar`, set up tooling (ESLint/Prettier/Vitest/Playwright), provision a Neon Postgres project, wire GitHub Actions CI, and confirm a hello-world deploys cleanly on Vercel preview. Do not start Sprint 1 modelling until Sprint 0's scaffold is in place and confirmed working.
