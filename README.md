# TalentBank Event Calendar

**Status:** ✅ Production Ready (All Sprints Complete)

A comprehensive event calendar system for career fairs across Malaysia, featuring a public calendar, registration system, admin CMS, and full calendar integration.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-green)](https://www.w3.org/WAI/WCAG22/quickref/)
[![Security: B+](https://img.shields.io/badge/Security-B%2B-brightgreen)](./docs/SECURITY_AUDIT.md)

---

## 🎯 Features

### Public Features
- 📅 **Full-Year Calendar** - Browse upcoming career fairs across Malaysia
- 🔍 **Advanced Filtering** - Filter by state, event type, and industry
- 📱 **Responsive Design** - Mobile-friendly interface
- ✉️ **Event Registration** - Register as candidate or employer
- 📥 **Calendar Export** - Download .ics files for personal calendars
- 🔔 **Webcal Subscription** - Subscribe to filtered calendar feeds
- 📚 **Past Events Archive** - Browse historical events with statistics

### Admin Features
- 🔐 **Google SSO** - Secure authentication via Google Workspace
- 👥 **Role-Based Access** - Admin, Editor, and Viewer roles
- ⚠️ **Clash Detection** - Automatic conflict detection (hard & soft clashes)
- 📊 **Capacity Management** - Track registrations and waitlists
- 📧 **Email Notifications** - Automated confirmation and reminder emails
- 🗂️ **Event Management** - Create, edit, cancel, and postpone events
- 📈 **Registration Dashboard** - View and export registration data

### Technical Features
- 🔒 **Security Hardened** - OWASP Top 10 compliant, security headers configured
- ♿ **Accessible** - WCAG 2.2 Level AA substantially compliant
- 🇲🇾 **PDPA Compliant** - Full compliance with Malaysian data protection laws
- 📝 **Comprehensive Documentation** - 1,200+ lines of docs for admins and developers
- ⚡ **Performance Optimized** - Edge-ready, cached API routes
- 🧪 **Well Tested** - Unit tests and manual QA

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Neon Postgres account (free tier)
- Google Cloud Console account (for OAuth)
- Resend account (for emails, optional)

### 1. Clone and Install

```bash
git clone <repository-url>
cd talentbank-event-calendar
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database (Required)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# App URL (Required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth (Required for admin access)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Email (Optional - works without it in dev mode)
RESEND_API_KEY=re_your_api_key
```

See [Environment Setup Guide](#environment-setup) for detailed instructions.

### 3. Initialize Database

```bash
# Push schema to database
npm run db:push

# Seed with sample events (optional)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- 🌐 Public Calendar: [http://localhost:3000/calendar](http://localhost:3000/calendar)
- 🔐 Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📚 Documentation

### For Administrators
- 📖 **[Admin Runbook](./docs/ADMIN_RUNBOOK.md)** - Complete guide for event coordinators
- 🚀 **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- 📧 **[Email Setup](./docs/EMAIL_SETUP.md)** - Configure Resend for notifications
- 🔐 **[Google OAuth Setup](./docs/GOOGLE_OAUTH_SETUP.md)** - Configure Google SSO

### For Developers
- 📋 **[Project Brief](./docs/PROJECT_BRIEF.md)** - Full project specification
- 🗄️ **[Schema Design](./docs/SCHEMA_DESIGN.md)** - Database architecture
- ♿ **[Accessibility Audit](./docs/ACCESSIBILITY_AUDIT.md)** - WCAG 2.2 compliance report
- 🔒 **[Security Audit](./docs/SECURITY_AUDIT.md)** - OWASP Top 10 analysis
- ✅ **[Sprint 6 Summary](./docs/SPRINT_6_SUMMARY.md)** - Latest sprint deliverables

---

## 🛠️ Tech Stack

### Core
- **Framework:** Next.js 15 (App Router) + TypeScript 5.3
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Authentication:** Auth.js v5 (NextAuth) with Google OAuth
- **Styling:** Tailwind CSS v4

### Features
- **Email:** Resend + React Email
- **Calendar:** ics (RFC 5545 compliant)
- **Validation:** Zod schemas
- **Date Handling:** date-fns

### Development
- **Testing:** Vitest (unit) + Playwright (e2e)
- **Linting:** ESLint + Prettier
- **Type Safety:** TypeScript strict mode
- **CI/CD:** GitHub Actions + Vercel

---

## 📁 Project Structure

```
talentbank-event-calendar/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── calendar/           # Public calendar pages
│   │   ├── events/[slug]/      # Event detail pages
│   │   ├── admin/              # Admin CMS (protected)
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── calendar/           # Calendar components
│   │   ├── registration/       # Registration forms
│   │   └── ui/                 # Reusable UI components
│   ├── db/
│   │   ├── schema/             # Database schema definitions
│   │   ├── seeds/              # Seed data and scripts
│   │   └── index.ts            # Database client
│   ├── lib/
│   │   ├── validations/        # Zod schemas
│   │   ├── calendar/           # Calendar generation
│   │   ├── email/              # Email utilities
│   │   └── auth.ts             # Auth.js configuration
│   └── emails/                 # Email templates
├── docs/                       # Comprehensive documentation
├── e2e/                        # Playwright tests
└── public/                     # Static assets
```

---

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript validation

# Testing
npm test                 # Run unit tests (Vitest)
npm run test:ui          # Vitest UI
npm run test:coverage    # Test coverage report
npm run test:e2e         # E2E tests (Playwright)

# Database
npm run db:push          # Push schema changes
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio GUI
npm run db:seed          # Seed database with events
```

---

## 📊 Sprint Status

**Project Status:** ✅ **PRODUCTION READY**

All 7 sprints completed (114 story points):

| Sprint | Features | Status |
|--------|----------|--------|
| **Sprint 0** | Groundwork & Infrastructure | ✅ Complete |
| **Sprint 1** | Data Model & Seeding | ✅ Complete |
| **Sprint 2** | Public Calendar | ✅ Complete |
| **Sprint 3** | Admin CMS & Auth | ✅ Complete |
| **Sprint 4** | Event Lifecycle Management | ✅ Complete |
| **Sprint 5** | Registration & Capacity | ✅ Complete |
| **Sprint 6** | Calendar Integration & Hardening | ✅ Complete |

**Latest Sprint (Sprint 6) Deliverables:**
- ✅ .ics calendar downloads
- ✅ Webcal subscription feeds
- ✅ Email notification system (Resend)
- ✅ Past events archive
- ✅ WCAG 2.2 AA accessibility compliance
- ✅ Security hardening (OWASP Top 10)
- ✅ Comprehensive admin documentation

See [`docs/SPRINT_6_SUMMARY.md`](./docs/SPRINT_6_SUMMARY.md) for complete details.

---

## 🔧 Environment Setup

### Required Services

1. **Neon Postgres** (Database)
   - Sign up: [console.neon.tech](https://console.neon.tech)
   - Free tier: 3 GB storage
   - Copy connection string to `DATABASE_URL`

2. **Google Cloud Console** (OAuth)
   - Create project at [console.cloud.google.com](https://console.cloud.google.com)
   - Enable Google+ API
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials
   - See [`docs/GOOGLE_OAUTH_SETUP.md`](./docs/GOOGLE_OAUTH_SETUP.md)

3. **Resend** (Email - Optional)
   - Sign up: [resend.com](https://resend.com)
   - Free tier: 100 emails/day
   - Add and verify your domain
   - Create API key
   - See [`docs/EMAIL_SETUP.md`](./docs/EMAIL_SETUP.md)

### Environment Variables

All variables are documented in `.env.example`. Copy to `.env.local` and fill in:

```bash
# Minimum required for development
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<32-char-random-string>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Optional (email notifications)
RESEND_API_KEY=re_...
```

---

## 🚀 Deployment

**Recommended Platform:** Vercel

Follow the complete deployment guide: [`docs/DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md)

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

The application is fully configured for Vercel with:
- ✅ Automatic deployments on push
- ✅ Preview environments for PRs
- ✅ Edge-ready API routes
- ✅ Security headers configured

---

## 🔒 Security

**Security Rating:** B+ (Good, Production Ready)

- ✅ SQL Injection Protection (Drizzle ORM parameterization)
- ✅ XSS Protection (React auto-escaping)
- ✅ CSRF Protection (SameSite cookies)
- ✅ Security Headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ OAuth 2.0 Authentication
- ✅ Input Validation (Zod schemas)
- ✅ HTTPS Enforced (Vercel automatic)

See full security audit: [`docs/SECURITY_AUDIT.md`](./docs/SECURITY_AUDIT.md)

---

## ♿ Accessibility

**WCAG Compliance:** 2.2 Level AA (Substantially Compliant)

- ✅ Semantic HTML
- ✅ Keyboard Navigation
- ✅ Screen Reader Compatible
- ✅ Color Contrast (7.2:1+ ratios)
- ✅ Skip Links
- ✅ ARIA Attributes

See full accessibility audit: [`docs/ACCESSIBILITY_AUDIT.md`](./docs/ACCESSIBILITY_AUDIT.md)

---

## 📄 License

Proprietary - TalentCorp Malaysia

---

## 🤝 Support

- 📖 **Documentation:** See [`docs/`](./docs) folder
- 🐛 **Issues:** Report via GitHub Issues
- 📧 **Contact:** events@talentcorp.com.my

---

## 🎉 Acknowledgments

Built with modern web technologies and best practices:
- Next.js team for the excellent framework
- Vercel for seamless deployment
- Neon for serverless Postgres
- Auth.js for authentication
- The open-source community

---

**Version:** 1.0.0 (Sprint 6 Complete)
**Last Updated:** 2026-07-28
**Status:** Production Ready ✅
