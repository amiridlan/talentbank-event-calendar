import {
  pgTable,
  uuid,
  varchar,
  date,
  time,
  text,
  integer,
  timestamp,
  check,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { eventTypeEnum, malaysianStateEnum, eventStatusEnum } from './enums'

/**
 * Main events table with date ranges for multi-day events
 */
export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),

    // Date range (dates are stored without time, rendered in Asia/Kuala_Lumpur)
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),

    // Time of day (optional - missing in source data, added by events team later)
    startTime: time('start_time'),
    endTime: time('end_time'),

    // Classification
    eventType: eventTypeEnum('event_type').notNull(),
    region: malaysianStateEnum('region').notNull(),

    // Venue (optional initially - missing in source data)
    venueName: varchar('venue_name', { length: 255 }),
    venueAddress: text('venue_address'),
    venueId: varchar('venue_id', { length: 100 }), // For clash detection (uses venue name)

    // External reference
    externalUrl: varchar('external_url', { length: 500 }),

    // Lifecycle
    status: eventStatusEnum('status').notNull().default('draft'),

    // Registration period
    registrationOpenDate: date('registration_open_date'),
    registrationCloseDate: date('registration_close_date'),

    // Capacity tracking (dual track: candidates + employers)
    candidateCapacity: integer('candidate_capacity'),
    candidateRegistered: integer('candidate_registered').default(0),
    employerCapacity: integer('employer_capacity'), // Booth count
    employerRegistered: integer('employer_registered').default(0),

    // Cancellation / Postponement
    cancellationReason: text('cancellation_reason'),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    postponedFromDate: date('postponed_from_date'),
    movedFromEventId: uuid('moved_from_event_id').references((): any => events.id),

    // Metadata
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar('created_by', { length: 255 }),
    updatedBy: varchar('updated_by', { length: 255 }),

    // Visibility
    publishedAt: timestamp('published_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => ({
    // Date range must be valid (end >= start)
    validDateRange: check('valid_date_range', sql`${table.endDate} >= ${table.startDate}`),

    // Indexes for common queries
    datesIdx: index('idx_events_dates').on(table.startDate, table.endDate),
    regionIdx: index('idx_events_region').on(table.region),
    statusIdx: index('idx_events_status').on(table.status),
    slugIdx: index('idx_events_slug').on(table.slug),
  })
)

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
