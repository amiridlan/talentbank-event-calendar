# TalentBank Event Calendar - Project Summary

**Developer:** Amir (with Claude Code Assistant)
**Timeline:** Sprint 0-6 (Full Development Cycle)
**Status:** Production Ready

---

## What We Built and Why

We built a comprehensive event management system for TalentCorp Malaysia's career fairs. The system includes a public-facing calendar where job seekers can browse and register for events, plus a back-office CMS for non-technical event coordinators to manage events without touching code. Key features include advanced filtering by state and industry, dual registration systems (candidates and employers), capacity management with waitlists, clash detection to prevent scheduling conflicts, calendar integration (.ics downloads and webcal subscriptions), and automated email notifications. The project was needed because TalentCorp wanted a standalone system independent of their main talentbank.io platform, with specific requirements for Malaysian data protection compliance (PDPA 2010) and the ability to handle complex scenarios like event cancellations, postponements, and venue conflicts.

## What We Cut

We documented but did not implement several enhancement features to keep the project focused on core functionality. Rate limiting was designed and documented with Upstash Redis integration but deferred as it requires additional infrastructure setup. Automated cron-based email reminders (7 days before events) were planned but left for post-launch implementation since the email templates and infrastructure are ready. Two-factor authentication for admin users was considered low priority given the Google OAuth security already in place. An analytics dashboard for tracking event performance metrics was postponed in favor of Vercel's built-in analytics. We also kept the @react-email deprecated packages rather than migrating to a newer email template library, accepting the technical debt since the packages remain functional.

## Where AI Was Wrong and How We Fixed It

The AI made several technical assumptions that required correction during development. Initially, it referenced database fields (`description`, `city`) that didn't exist in the schema, causing TypeScript errors in the .ics generator and API routes - this was fixed by removing those references and using only existing schema fields like `venueName` and `region`. The AI installed the deprecated `@react-email/components` package which failed at import time; this was corrected by installing individual component packages (`@react-email/html`, `@react-email/body`, etc.) and updating all imports. During database setup, `drizzle.config.ts` couldn't access environment variables, throwing errors during migrations - solved by installing `dotenv` and explicitly loading `.env.local` in the config file. The registration API had null-handling issues where `candidateRegistered` and `employerRegistered` could be null but were used in arithmetic operations - fixed by adding null coalescing operators (`?? 0`) throughout. These corrections improved my understanding of Drizzle ORM constraints, Next.js environment variable loading, and the importance of validating schema assumptions before writing dependent code.

## Technical Achievement

The final system successfully passed strict TypeScript compilation (zero errors), achieved WCAG 2.2 Level AA accessibility compliance, implemented OWASP Top 10 security protections with custom headers, and includes 1,200+ lines of comprehensive documentation. All 114 story points across 6 sprints were delivered, with the system deployed and ready for production use on Vercel with Neon Postgres, Auth.js authentication, and Resend email integration.

---

**Tech Stack:** Next.js 15, TypeScript, PostgreSQL (Neon), Drizzle ORM, Auth.js, Resend, Tailwind CSS
**Documentation:** 10 comprehensive guides including deployment, security audit, and admin runbook
**Compliance:** PDPA 2010, WCAG 2.2 AA, OWASP Top 10
