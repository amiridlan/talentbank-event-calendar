# TalentBank Event Calendar - Demo Script

**Total Duration:** ~10-15 minutes
**Presenter:** Your Name
**Date:** 2026-07-29

---

## 📋 Pre-Demo Checklist

Before recording:
- [ ] Development server running (`npm run dev`)
- [ ] Database seeded with sample events
- [ ] Admin user created and ready to log in
- [ ] Browser windows prepared (public calendar + admin panel)
- [ ] Code editor open with key files ready to show
- [ ] Good lighting and clear audio setup

---

## 🎬 Introduction (30 seconds)

### What to Show
- Show your face or screen with project title

### Script

> "Hi! I'm [Your Name], and today I'm going to walk you through the TalentBank Event Calendar—a production-ready system I built for managing career fair events across Malaysia.
>
> This is a full-stack Next.js application that handles everything from public event discovery to admin management, complete with registrations, capacity tracking, and calendar integrations.
>
> I'll first show you the application in action, then dive into the code to explain the architecture and technical decisions I made. Let's get started!"

---

## 🌐 Part 1: Public Features Walkthrough (3-4 minutes)

### Scene 1: Public Calendar View (45 seconds)

**What to Show:**
- Navigate to `http://localhost:3000/calendar`
- Show the calendar with events listed by month

**Script:**

> "Let's start with what job seekers and employers would see. This is the public calendar view showing all upcoming career fairs across Malaysia.
>
> Events are organized by month, making it easy to scan what's coming up. You can see key information at a glance—event name, date, location, and event type indicated by these colored badges."

### Scene 2: Filtering & Search (1 minute)

**What to Show:**
- Use the state filter (select "Selangor")
- Use the event type filter (select "Campus")
- Use the search box (type "UiTM")
- Clear filters

**Script:**

> "Now, here's where it gets useful. Say you're a student in Selangor looking for campus career fairs. I can filter by state—let's select Selangor—and by event type—Campus. The results update instantly.
>
> There's also a search function. If I'm specifically looking for UiTM events, I just type it here and the calendar narrows down to matching events.
>
> This filtering system helps users quickly find events relevant to them without scrolling through dozens of irrelevant listings."

### Scene 3: Event Detail Page (1 minute)

**What to Show:**
- Click on an event
- Scroll through event details (venue, date, capacity, industries)
- Show the registration button

**Script:**

> "Clicking on any event takes you to the detailed page. Here you can see all the information about the event—the full venue address, exact dates and times, what industries will be represented, and capacity information.
>
> If spots are available, users can register directly from this page. Notice the capacity tracker showing how many candidate spots and employer booths are still available. This real-time tracking helps users know if they need to register urgently."

### Scene 4: Registration Flow (1 minute)

**What to Show:**
- Click "Register as Candidate"
- Fill out the registration form
- Show PDPA consent checkbox
- Submit and show confirmation

**Script:**

> "Let me register as a candidate. The form asks for essential information—name, email, phone number, and optionally the organization you're representing.
>
> Notice this PDPA consent checkbox—that's for Malaysian data protection compliance. Users must explicitly consent to data processing.
>
> After submitting, you get an immediate confirmation with your registration details. If the event were full, you'd be added to a waitlist instead and shown your position in the queue."

### Scene 5: Calendar Export (45 seconds)

**What to Show:**
- Show the .ics download button
- Download the file and show it can be opened in calendar apps
- Show the webcal subscription link

**Script:**

> "One feature I'm particularly proud of is the calendar integration. Users can download individual events as .ics files and add them directly to Google Calendar, Outlook, or Apple Calendar.
>
> There's also a webcal subscription feature—users can subscribe to a filtered feed, say 'all tech events in Selangor,' and their calendar automatically updates when event dates change. This makes the calendar a planning tool, not just a listing."

---

## 🔐 Part 2: Admin Features Walkthrough (3-4 minutes)

### Scene 6: Admin Login (30 seconds)

**What to Show:**
- Navigate to `/admin`
- Show Google SSO and credentials login options
- Sign in

**Script:**

> "Now let's switch to the admin side. The admin panel is protected—only authorized staff can access it.
>
> I implemented dual authentication: Google SSO for TalentCorp staff using Workspace accounts, and traditional credentials for external coordinators. This flexibility was important for real-world usage."

### Scene 7: Admin Dashboard (45 seconds)

**What to Show:**
- Show the dashboard with event statistics
- Point out upcoming events, total registrations
- Show navigation sidebar

**Script:**

> "Once logged in, admins see this dashboard with key metrics—total events, upcoming events, total registrations. It gives you a quick health check of the system.
>
> The sidebar provides access to all admin functions: event management, registration tracking, and user management. Notice my role is shown here—this system supports three roles: Admin, Editor, and Viewer with different permission levels."

### Scene 8: Creating an Event (1.5 minutes)

**What to Show:**
- Click "Create New Event"
- Fill out the event form (name, type, dates, venue, capacity, industries)
- Show registration period control
- Show external URL field
- Save as draft

**Script:**

> "Let me create a new event. The form captures everything needed: event name, type—I'll select Campus—state, and dates.
>
> An important feature here is the venue ID. This is used for clash detection. If I try to create two events at the same venue on the same dates, the system will block it—that's a hard clash, physically impossible.
>
> I can set capacity limits for both candidates and employers separately. If I leave these blank, registration is unlimited.
>
> These registration period fields let admins control when registration opens and closes, independent of the event date. Very useful for planning.
>
> I can also add an external URL if the event has its own microsite. And finally, I can save this as a draft to review later, or publish it immediately."

### Scene 9: Clash Detection (1 minute)

**What to Show:**
- Try to create/edit an event that conflicts
- Show hard clash error (same venue, same date)
- Show soft clash warning (same state, same industry, nearby dates)

**Script:**

> "Let me demonstrate the clash detection. I'll try to create an event at the same venue on the same date as an existing event.
>
> See that? The system blocks it entirely—this is a hard clash. Two events can't physically happen at the same venue simultaneously.
>
> Now let me try creating a tech event in Selangor just a few days after another tech event in Selangor. This triggers a soft clash warning—it shows the conflicting event but lets me proceed if intentional. This prevents accidental scheduling conflicts while not being overly restrictive."

### Scene 10: Registration Management (1 minute)

**What to Show:**
- View registrations for an event
- Show candidate and employer lists
- Show waitlist
- Export to CSV

**Script:**

> "Admins can view all registrations for any event. Here's the list of candidates and employers who've signed up.
>
> If capacity is reached, this Waitlist tab shows people waiting for spots. Admins can manually promote people from the waitlist if spaces open up.
>
> All this data can be exported to CSV for external processing or printing name badges. This export includes all the information—names, emails, organizations, registration timestamps."

---

## 💻 Part 3: Code & Architecture Explanation (5-7 minutes)

### Scene 11: Project Structure (1 minute)

**What to Show:**
- Open VS Code
- Show folder structure in sidebar
- Navigate through key directories

**Script:**

> "Now let's look at the code. I structured this as a Next.js 15 App Router project with clear separation of concerns.
>
> The `src/app` directory contains all routes—public calendar pages, admin pages, and API routes. Next.js automatically creates routes based on folder structure, which keeps things organized.
>
> `src/components` has reusable React components, separated by feature—calendar components, registration forms, and base UI components.
>
> `src/db` contains the database layer—schemas, migrations, and seed scripts. This is where the data model lives.
>
> `src/lib` has utility functions—validation schemas, calendar generation logic, and authentication configuration."

### Scene 12: Database Schema (1.5 minutes)

**What to Show:**
- Open `src/db/schema/events.ts`
- Show the events table definition
- Open `src/db/schema/registrations.ts`

**Script:**

> "The database schema is the foundation of this application. Let me show you the events table.
>
> I'm using Drizzle ORM with PostgreSQL. This is the events schema—each event has a name, type, region, dates, venue information, and capacity fields.
>
> Notice these fields: `candidateCapacity` and `employerCapacity`. I separated these because they're independent metrics—an event might have 500 candidate spots but only 20 employer booths.
>
> The `status` field uses an enum—draft, scheduled, postponed, cancelled, or completed. This state machine approach makes event lifecycle management clean and predictable.
>
> For registrations, I have a separate table that links to events via foreign key. Each registration stores user information, consent timestamps for PDPA compliance, and status—confirmed or waitlisted.
>
> The beauty of Drizzle is that it's type-safe. These schemas generate TypeScript types automatically, so I get full autocomplete and type checking throughout the application."

### Scene 13: API Architecture (1.5 minutes)

**What to Show:**
- Open `src/app/api/events/route.ts`
- Show the GET handler with filtering logic
- Open `src/app/api/events/[id]/register/route.ts`
- Show capacity checking logic

**Script:**

> "The API layer is built with Next.js Route Handlers. Here's the events endpoint.
>
> This GET handler supports filtering by year, state, event type, and search query. I'm using Drizzle's query builder to construct SQL dynamically based on which filters are provided.
>
> Notice the Zod validation at the top—every input is validated before processing. This prevents SQL injection and ensures data integrity.
>
> Now look at the registration endpoint. This is more complex because it handles capacity checking.
>
> When someone registers, I first check if they've already registered—no duplicates allowed. Then I calculate if there's available capacity. If the event is full, the registration status is set to 'waitlisted' and I calculate their position in the queue.
>
> Only if the registration is confirmed do I increment the event's registration count. This atomic approach prevents race conditions where multiple people could register for the last spot simultaneously."

### Scene 14: Authentication & Authorization (1 minute)

**What to Show:**
- Open `src/lib/auth.ts`
- Show Auth.js configuration
- Show Google and Credentials providers
- Show role-based middleware

**Script:**

> "For authentication, I'm using Auth.js version 5 with two providers: Google OAuth for staff and credentials for external users.
>
> The Google provider integrates with TalentCorp's Workspace, providing SSO. The credentials provider uses bcrypt for password hashing—never storing plain text passwords.
>
> Every user has a role: admin, editor, or viewer. This role is stored in the database and attached to the session. Throughout the app, I check this role to control what users can see and do.
>
> For example, only admins can delete events. Editors can create and modify, but not delete. Viewers have read-only access."

### Scene 15: Key Technical Decisions (2 minutes)

**What to Show:**
- Show `package.json` dependencies
- Keep relevant files visible

**Script:**

> "Let me explain the key technology choices and why I made them.
>
> **Next.js 15**: I chose Next.js because it's a full-stack framework. I can build the public pages, admin panel, and API all in one codebase. The App Router gives me server components for better performance and SEO, which matters for a public calendar.
>
> **PostgreSQL + Neon**: I specifically needed PostgreSQL for its advanced features. The clash detection uses date range types and exclusion constraints—SQL features that enforce hard clashes at the database level, not just application level. This is bulletproof. Neon provides serverless Postgres, which scales automatically and keeps costs low.
>
> **Drizzle ORM**: I picked Drizzle over Prisma because it's lighter, has better cold-start performance on serverless, and doesn't abstract away SQL. When I needed to write complex queries for clash detection, I could drop down to raw SQL easily.
>
> **Zod for Validation**: Every form, every API endpoint uses Zod schemas for validation. This creates a single source of truth—the same schema validates on the client and server, preventing inconsistencies.
>
> **Tailwind CSS**: For styling, Tailwind let me build a responsive, accessible interface quickly without writing custom CSS. The utility-first approach kept the code maintainable.
>
> **TypeScript**: Everything is TypeScript with strict mode enabled. This catches errors at compile time, not runtime. Combined with Drizzle's generated types, I have end-to-end type safety from database to UI.
>
> I deliberately avoided over-engineering. No GraphQL, no microservices, no complex state management. This is a Next.js monolith with clear separation of concerns, which makes it easy to understand and maintain."

---

## 🎯 Part 4: Code Quality & Best Practices (1-2 minutes)

### Scene 16: Code Quality (1 minute)

**What to Show:**
- Run `npm run type-check` in terminal
- Run `npm run lint` in terminal
- Show a component with proper TypeScript types

**Script:**

> "Code quality was a priority. Let me demonstrate.
>
> Running type-check shows zero TypeScript errors. This is strict mode—no 'any' types allowed.
>
> ESLint runs clean as well. I configured it to catch common React mistakes and enforce consistent code style.
>
> In the actual components, you'll see I follow best practices: proper prop typing, error boundaries, accessible markup with semantic HTML and ARIA labels.
>
> For example, this calendar component uses proper heading hierarchy, keyboard navigation works throughout, and all interactive elements are focusable. This ensures WCAG 2.2 Level AA compliance."

### Scene 17: Security Considerations (1 minute)

**What to Show:**
- Open `next.config.ts`
- Show security headers

**Script:**

> "Security is built in from the start. In the Next.js config, I've set security headers: Content Security Policy to prevent XSS, HSTS to enforce HTTPS, X-Frame-Options to prevent clickjacking.
>
> At the database level, Drizzle uses parameterized queries, so SQL injection is impossible. User inputs are sanitized by Zod before ever touching the database.
>
> For authentication, sessions use secure, httpOnly cookies. Passwords are hashed with bcrypt at cost factor 10.
>
> The admin panel is fully protected—middleware checks authentication on every request. Unauthorized access is blocked at the server level, not just hidden in the UI."

---

## 🎬 Closing (1 minute)

### Scene 18: Wrap Up

**What to Show:**
- Show the running application one more time
- Maybe show the README

**Script:**

> "So that's the TalentBank Event Calendar. To recap:
>
> We have a fully functional public-facing calendar with filtering, search, and registration. Users can export events to their personal calendars.
>
> The admin panel provides complete event lifecycle management—creating, editing, cancelling events—with intelligent clash detection and capacity tracking.
>
> The codebase is production-ready: type-safe, well-tested, secure, and documented.
>
> I built this with modern, industry-standard tools—Next.js, TypeScript, PostgreSQL—following best practices for performance, accessibility, and security.
>
> The entire system is deployed on Vercel with Neon Postgres, and it's ready to handle real-world traffic.
>
> Thanks for watching! If you have questions about any of the technical decisions or want to dive deeper into specific features, I'm happy to discuss."

---

## 📌 Tips for Recording

### Before You Start
1. **Practice the script 2-3 times** to sound natural, not like you're reading
2. **Prepare your demo data** - have realistic event names and data
3. **Clear your browser history/cache** for a clean demo
4. **Close unnecessary browser tabs** and applications
5. **Test your audio** - speak clearly and at a good pace

### During Recording
1. **Speak conversationally** - imagine explaining to a colleague
2. **Slow down** - nerves make people talk fast
3. **Pause between sections** - easier to edit later
4. **Show, don't just tell** - let the application speak for itself
5. **If you make a mistake**, pause, then restart that section

### After Recording
1. **Watch it once** to check for major issues
2. **Basic editing**: trim dead air, remove long pauses
3. **Add simple transitions** between sections if needed
4. **Export at 1080p** minimum for clarity

---

## 🎨 Optional: Screen Recording Setup

### Recommended Tools
- **Windows**: OBS Studio (free) or Camtasia
- **Mac**: QuickTime, ScreenFlow, or Camtasia
- **Cross-platform**: OBS Studio, Loom

### Settings
- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 30 fps is sufficient
- **Audio**: 48kHz, clear microphone
- **Format**: MP4 (H.264 codec)

### Layout Options
1. **Full screen recording** - just the app
2. **Picture-in-picture** - small webcam overlay in corner
3. **Side-by-side** - code on one side, running app on other

---

## ⏱️ Time Management

If you need to shorten the demo:

**10-minute version:**
- Introduction: 30s
- Public walkthrough: 2 min (skip some filters)
- Admin walkthrough: 2 min (skip clash detection demo)
- Code explanation: 4 min (focus on architecture and tech stack)
- Closing: 30s

**5-minute version:**
- Introduction: 20s
- Quick public demo: 1 min
- Quick admin demo: 1 min
- Tech stack explanation: 2 min
- Closing: 20s

---

**Good luck with your demo! You've built something impressive—now show it off! 🚀**
