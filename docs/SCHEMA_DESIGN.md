# Database Schema Design - Sprint 1

## Overview

This schema supports the core requirements from PROJECT_BRIEF.md:
- Multi-day events with date ranges
- Venue clash prevention (hard constraint)
- Soft clash detection (same state + field + date proximity)
- Lifecycle management (draft → scheduled → cancelled/postponed/completed)
- Dual capacity tracking (candidate seats + employer booths)
- Audit trail for changes
- Normalized taxonomies

## Core Tables

### 1. `events`

The main event table with date ranges instead of single dates.

```sql
events {
  id: uuid PRIMARY KEY
  name: varchar(255) NOT NULL
  slug: varchar(255) UNIQUE NOT NULL  -- URL-friendly, auto-generated from name

  -- Dates (using Postgres date type, rendered in Asia/Kuala_Lumpur)
  start_date: date NOT NULL
  end_date: date NOT NULL
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)

  -- Time (optional - missing in source data, will be added by events team)
  start_time: time
  end_time: time

  -- Type & Classification
  event_type: event_type_enum NOT NULL  -- Campus | Sector | Public | Awards
  region: malaysian_state_enum NOT NULL

  -- Venue (optional initially - missing in source data)
  venue_name: varchar(255)
  venue_address: text
  venue_id: varchar(100)  -- Identifier for venue clash detection

  -- External reference
  external_url: varchar(500)  -- e.g., utarcareerfair.com

  -- Lifecycle
  status: event_status_enum NOT NULL DEFAULT 'draft'
    -- draft | scheduled | postponed | cancelled | completed

  -- Capacity tracking (dual track)
  candidate_capacity: integer
  candidate_registered: integer DEFAULT 0
  employer_capacity: integer  -- booth count
  employer_registered: integer DEFAULT 0

  -- Cancellation / Postponement
  cancellation_reason: text
  cancelled_at: timestamp with time zone
  postponed_from_date: date  -- Original date if postponed
  moved_from_event_id: uuid REFERENCES events(id)  -- If moved/rescheduled

  -- Metadata
  created_at: timestamp with time zone DEFAULT now()
  updated_at: timestamp with time zone DEFAULT now()
  created_by: varchar(255)  -- User ID (Sprint 3)
  updated_by: varchar(255)

  -- Visibility
  published_at: timestamp with time zone
  archived_at: timestamp with time zone
}
```

**Indexes:**
- `idx_events_dates` on `(start_date, end_date)` for date range queries
- `idx_events_region` on `region` for filtering
- `idx_events_status` on `status` for upcoming/active queries
- `idx_events_slug` on `slug` (unique) for SEO URLs

**Exclusion Constraint (Hard Venue Clash):**
```sql
-- Requires btree_gist extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE events ADD CONSTRAINT no_venue_clash
  EXCLUDE USING gist (
    venue_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
  WHERE (venue_id IS NOT NULL AND status NOT IN ('cancelled', 'draft'));
```

This prevents two events from booking the same venue on overlapping dates.

---

### 2. `event_fields` (Many-to-Many with normalized taxonomy)

Links events to industry fields/subjects.

```sql
event_fields {
  event_id: uuid REFERENCES events(id) ON DELETE CASCADE
  field_id: integer REFERENCES fields(id)

  PRIMARY KEY (event_id, field_id)
}
```

---

### 3. `fields` (Normalized Industry/Subject Taxonomy)

Canonical list of industries/subjects, cleaned from the messy source data.

```sql
fields {
  id: serial PRIMARY KEY
  name: varchar(100) UNIQUE NOT NULL  -- e.g., "Information Technology"
  slug: varchar(100) UNIQUE NOT NULL  -- e.g., "information-technology"
  category: varchar(50)  -- e.g., "STEM", "Business", "Arts"

  -- Mapping from raw source data
  raw_aliases: text[]  -- e.g., ["IT", "Info Tech", "Information Tech"]
}
```

**Seed Data** (canonical taxonomy):
- Information Technology (maps from: IT, Info Tech, Computing, Computer Science)
- Engineering
- Business & Finance (maps from: Business, Finance, Business Adminstration, Business and Finance)
- Social Sciences (maps from: Social Science, Social Sciences)
- Applied Sciences (maps from: Applied Science, Applied Sciences)
- Media & Communication (maps from: Media and Communication, Communication)
- Accounting
- Education
- etc.

---

### 4. `event_changes` (Audit Trail)

Public-facing change history for transparency.

```sql
event_changes {
  id: uuid PRIMARY KEY
  event_id: uuid REFERENCES events(id) ON DELETE CASCADE

  change_type: change_type_enum NOT NULL
    -- created | updated | postponed | cancelled | restored | capacity_updated

  field_changed: varchar(100)  -- e.g., "start_date", "status"
  old_value: text
  new_value: text

  reason: text  -- User-provided reason for change

  changed_at: timestamp with time zone DEFAULT now()
  changed_by: varchar(255)  -- User ID

  -- Public visibility
  is_public: boolean DEFAULT true
}
```

**Indexes:**
- `idx_event_changes_event` on `event_id` for history queries
- `idx_event_changes_date` on `changed_at DESC`

---

### 5. `registrations` (Candidate & Employer Signups)

For Sprint 5, but schema included now for completeness.

```sql
registrations {
  id: uuid PRIMARY KEY
  event_id: uuid REFERENCES events(id)

  registration_type: registration_type_enum NOT NULL
    -- candidate | employer

  -- Contact Info
  email: varchar(255) NOT NULL
  name: varchar(255) NOT NULL
  phone: varchar(50)
  organization: varchar(255)  -- For employers, or university for candidates

  -- Status
  status: registration_status_enum NOT NULL DEFAULT 'pending'
    -- pending | confirmed | waitlisted | cancelled

  -- PDPA 2010 Compliance
  consent_marketing: boolean DEFAULT false
  consent_data_processing: boolean NOT NULL
  consented_at: timestamp with time zone

  -- Waitlist management
  waitlisted_at: timestamp with time zone
  promoted_from_waitlist_at: timestamp with time zone

  -- Metadata
  registered_at: timestamp with time zone DEFAULT now()
  cancelled_at: timestamp with time zone

  -- Employer-specific fields
  booth_count: integer  -- For employer registrations

  CONSTRAINT unique_registration UNIQUE (event_id, email, registration_type)
}
```

**Indexes:**
- `idx_registrations_event` on `event_id`
- `idx_registrations_email` on `email` for lookups
- `idx_registrations_status` on `status`

---

## Enums

### `event_type_enum`
```sql
CREATE TYPE event_type_enum AS ENUM (
  'campus',      -- University career fair
  'sector',      -- Industry-specific (tech, engineering, etc.)
  'public',      -- Open to all
  'awards'       -- Gala/awards events (decide if in scope)
);
```

### `malaysian_state_enum`
```sql
CREATE TYPE malaysian_state_enum AS ENUM (
  'johor',
  'kedah',
  'kelantan',
  'kuala_lumpur',
  'labuan',
  'melaka',           -- Fixed from "Melacca"
  'negeri_sembilan',
  'pahang',
  'penang',
  'perak',
  'perlis',
  'putrajaya',
  'sabah',
  'sarawak',
  'selangor',
  'terengganu',       -- Fixed from "Terrengganu"
  'klang_valley'      -- Special: KL + Selangor combined
);
```

### `event_status_enum`
```sql
CREATE TYPE event_status_enum AS ENUM (
  'draft',
  'scheduled',
  'postponed',
  'cancelled',
  'completed'
);
```

### `change_type_enum`
```sql
CREATE TYPE change_type_enum AS ENUM (
  'created',
  'updated',
  'postponed',
  'cancelled',
  'restored',
  'capacity_updated',
  'date_changed'
);
```

### `registration_type_enum`
```sql
CREATE TYPE registration_type_enum AS ENUM (
  'candidate',
  'employer'
);
```

### `registration_status_enum`
```sql
CREATE TYPE registration_status_enum AS ENUM (
  'pending',
  'confirmed',
  'waitlisted',
  'cancelled'
);
```

---

## Data Mapping from Source

### Multi-Day Event Merging

**Source has 31 rows → Target will have 24 events** (7 pairs merged)

| Event Name (Source) | Dates | Action |
|---|---|---|
| Johor Premium Career Fair | 2026-10-03, 2026-10-04 | Merge → start: 2026-10-03, end: 2026-10-04 |
| IGNITE UTHM | 2026-10-20, 2026-10-21 | Merge → start: 2026-10-20, end: 2026-10-21 |
| UMT Career & Internship Fair | 2026-10-23, 2026-10-24 | Merge → start: 2026-10-23, end: 2026-10-24 |
| Sunway University Get Hired (Day 1), (Day 2) | 2026-10-27, 2026-10-28 | Merge → "Sunway University Get Hired" (drop Day 1/2) |
| UPM Talent Fest | 2026-11-11, 2026-11-12 | Merge → start: 2026-11-11, end: 2026-11-12 |
| Talentbank Career Fair | 2027-04-03, 2027-04-04 | Merge → start: 2027-04-03, end: 2027-04-04 |
| National Career Fair / National Career Fair ABC | 2027-06-26, 2027-06-27 | Merge → "National Career Fair" |

### Region Normalization

| Source | Target Enum |
|---|---|
| `"Johor "` (trailing space) | `johor` |
| `"Johor"` | `johor` |
| `"Melacca "` | `melaka` |
| `"Terrengganu"` | `terengganu` |
| `"Klang Valley"` | `klang_valley` |
| `"Kuala Lumpur"` | `kuala_lumpur` |
| `"Selangor"` | `selangor` |
| etc. | (lowercase, underscores) |

### Event Type Normalization

| Source | Target Enum |
|---|---|
| `"Campus"` | `campus` |
| `"Sector"` | `sector` |
| `"Public"` | `public` |
| `"Awards"` | `awards` |

**Decision on "Awards" type:** Keep it for now. The 9th Graduates' Choice Award Gala is a single event. If it doesn't fit the calendar's purpose, it can be filtered out in the UI or marked as a different category.

---

## Migration Strategy

**Sprint 1:**
1. Create all enums
2. Enable `btree_gist` extension
3. Create `fields` table and seed canonical taxonomy
4. Create `events` table with all constraints
5. Create `event_fields` junction table
6. Create `event_changes` audit table
7. Create `registrations` table (schema only, not used until Sprint 5)

**Drizzle ORM Structure:**
```
src/db/
├── schema/
│   ├── enums.ts          # All enum definitions
│   ├── events.ts         # Events table
│   ├── fields.ts         # Fields taxonomy
│   ├── eventFields.ts    # Junction table
│   ├── eventChanges.ts   # Audit trail
│   ├── registrations.ts  # Registration (Sprint 5)
│   └── index.ts          # Export all schemas
└── index.ts              # Database connection
```

---

## Soft Clash Detection (Application-Level)

Not a database constraint, but a warning system in the admin UI (Sprint 4):

**Logic:**
```
When creating/editing an event:
  Query for events WHERE:
    - region = same state
    - date ranges overlap (start_date <= new_end_date AND end_date >= new_start_date)
    - shares at least one field/industry
    - status IN ('scheduled', 'postponed')
    - within N days (configurable, default 7)

  IF matches found:
    SHOW warning with list of conflicting events
    ALLOW user to proceed with logged acknowledgement
```

---

## Timezone Handling

**Rule:** All dates stored as `date` (no time component), all timestamps as `timestamp with time zone`.

**Rendering:** Always render in `Asia/Kuala_Lumpur` timezone.

**Testing:** Explicit test coverage to ensure Oct 3 never renders as Oct 2.

---

## Next Steps

1. Implement this schema in Drizzle ORM (Task #12)
2. Build the canonical fields taxonomy (Task #11)
3. Create mapping logic for data cleaning (Task #13)
4. Import the 31 → 24 events with cleaned data

---

## Open Questions for User

1. **Awards event:** Keep "Awards" as an event type, or exclude from calendar entirely?
2. **Capacity:** Should we seed initial capacity values, or leave them NULL for events team to fill in Sprint 3?
3. **Venue IDs:** Use venue name as ID for now, or create separate venues table?

