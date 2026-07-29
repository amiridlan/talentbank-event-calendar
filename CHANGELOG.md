# Changelog

All notable changes to the TalentBank Event Calendar project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-07-29

### Removed
- **Email Notification System**: Removed Resend integration and all email-related functionality
  - Removed `src/lib/email/` directory and all email utility code
  - Removed `src/emails/` directory and all email templates
  - Removed email sending from registration flow
  - Removed email-related environment variables (`RESEND_API_KEY`)
  - System now works without email dependencies
  - Registration confirmations still work, displayed as in-app messages

### Changed
- **Simplified Dependencies**: Removed Resend, React Email, and related email packages from `package.json`
- **API Routing**: Fixed routing issues in calendar and event APIs
- **Zod Validation**: Updated and refined validation schemas across the application
- **Enum Definitions**: Fixed and standardized enum values throughout the codebase

### Documentation
- Updated all documentation to reflect removal of email features
- Removed obsolete documentation files:
  - `docs/EMAIL_SETUP.md`
  - `docs/GOOGLE_OAUTH_SETUP.md`
  - `docs/ACCESSIBILITY_AUDIT.md`
  - `docs/SECURITY_AUDIT.md`
  - `docs/SPRINT_6_SUMMARY.md`
  - `docs/VERCEL_SETUP.md`
- Updated `README.md` to remove email feature references and dead documentation links
- Updated `ADMIN_RUNBOOK.md` to remove email notification sections
- Updated `DEPLOYMENT_GUIDE.md` to remove Resend setup steps
- Updated `PROJECT_STATUS.md` to reflect current state
- Updated `.env.example` to remove email-related variables

### Migration Notes
**Upgrading from v1.1.0 to v1.2.0:**

No database changes required. The application will work the same way for end users, except:
- Registration confirmations now only show in-app messages (no email sent)
- Admins should manually communicate with registrants via their organization's existing channels

To clean up your environment (optional):
1. Remove `RESEND_API_KEY` from your `.env.local` file
2. Run `npm install` to update dependencies

---

## [1.1.0] - 2026-07-29

### Added
- **Registration Period Control**: Events now have dedicated `registrationOpenDate` and `registrationCloseDate` fields
  - Allows setting when registration opens and closes independently from the event dates
  - Fields are visible in both event creation and edit forms
  - Database migration added: `0002_overconfident_pestilence.sql`
- **External Registration Links**: Added `externalUrl` field to events
  - Optional field for linking to third-party registration systems
  - Supports URL validation in forms
  - Useful for events with external event management platforms
- **Credentials Authentication**: Added username/password authentication alongside Google OAuth
  - Dual authentication system supports both Google SSO and traditional credentials
  - Secure password hashing with bcryptjs
  - Useful for users without Google Workspace accounts

### Fixed
- **TypeScript Build Errors**: Resolved all TypeScript errors preventing production builds
  - Fixed nullable field type error in edit form (`venueName` field)
  - Fixed `user.id` type narrowing in JWT callback
  - Updated JWT module augmentation path from `next-auth/jwt` to `@auth/core/jwt` for Auth.js v5
  - Added Suspense boundary for `useSearchParams()` in signin page
- **Form Validation**: Improved handling of optional and nullable fields throughout admin forms
- **Database Schema**: Added missing columns to production schema via migration

### Changed
- Updated authentication configuration to use JWT sessions for both OAuth and Credentials providers
- Enhanced form UX with proper default values for nullable database fields
- Improved TypeScript type safety across authentication flow

### Documentation
- Updated `README.md` with new features and `AUTH_SECRET` environment variable
- Updated `.env.example` with `AUTH_SECRET` configuration
- Created `CHANGELOG.md` for tracking project changes
- Incremented version to 1.1.0

### Migration Guide
To upgrade from v1.0.0 to v1.1.0:

1. **Add environment variable** to `.env.local`:
   ```bash
   AUTH_SECRET=<generate-with-openssl-rand-base64-32>
   ```

2. **Apply database migration**:
   ```bash
   npm run db:push
   ```
   This adds `registration_open_date` and `registration_close_date` columns to the events table.

3. **Update existing events** (optional):
   - Existing events will have `null` registration dates
   - Edit events in the admin panel to set registration periods

---

## [1.0.0] - 2026-07-28

### Initial Production Release
- ✅ Complete event calendar system for Malaysian career fairs
- ✅ Public calendar with filtering and search
- ✅ Event registration system (candidates + employers)
- ✅ Admin CMS with role-based access control
- ✅ Google OAuth authentication
- ✅ .ics calendar downloads and webcal subscriptions
- ✅ WCAG 2.2 Level AA accessibility compliance
- ✅ OWASP Top 10 security hardening
- ✅ Comprehensive documentation (1,200+ lines)

**Sprints Completed:**
- Sprint 0: Groundwork & Infrastructure
- Sprint 1: Data Model & Seeding
- Sprint 2: Public Calendar
- Sprint 3: Admin CMS & Auth
- Sprint 4: Event Lifecycle Management
- Sprint 5: Registration & Capacity
- Sprint 6: Calendar Integration & Hardening

---

[1.2.0]: https://github.com/talentcorp/event-calendar/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/talentcorp/event-calendar/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/talentcorp/event-calendar/releases/tag/v1.0.0
