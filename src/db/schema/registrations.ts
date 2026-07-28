import { pgTable, uuid, varchar, boolean, timestamp, integer, index, unique } from 'drizzle-orm/pg-core'
import { events } from './events'
import { registrationTypeEnum, registrationStatusEnum } from './enums'

/**
 * Registration for candidates and employers
 * Supports waitlist management and PDPA 2010 compliance
 * (Sprint 5 implementation)
 */
export const registrations = pgTable(
  'registrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id),

    registrationType: registrationTypeEnum('registration_type').notNull(),

    // Contact Info
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    organization: varchar('organization', { length: 255 }), // Employer or university name

    // Status
    status: registrationStatusEnum('status').notNull().default('pending'),

    // PDPA 2010 Compliance (Malaysian Personal Data Protection Act)
    consentMarketing: boolean('consent_marketing').default(false).notNull(),
    consentDataProcessing: boolean('consent_data_processing').notNull(),
    consentedAt: timestamp('consented_at', { withTimezone: true }),

    // Waitlist management
    waitlistedAt: timestamp('waitlisted_at', { withTimezone: true }),
    promotedFromWaitlistAt: timestamp('promoted_from_waitlist_at', { withTimezone: true }),

    // Metadata
    registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow().notNull(),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),

    // Employer-specific fields
    boothCount: integer('booth_count'), // Number of booths requested
  },
  (table) => ({
    eventIdx: index('idx_registrations_event').on(table.eventId),
    emailIdx: index('idx_registrations_email').on(table.email),
    statusIdx: index('idx_registrations_status').on(table.status),
    uniqueRegistration: unique('unique_registration').on(
      table.eventId,
      table.email,
      table.registrationType
    ),
  })
)

export type Registration = typeof registrations.$inferSelect
export type NewRegistration = typeof registrations.$inferInsert
