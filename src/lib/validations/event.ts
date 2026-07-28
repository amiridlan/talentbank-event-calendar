import { z } from 'zod'

// Enum schemas matching database enums
export const eventTypeSchema = z.enum(['campus', 'sector', 'public', 'awards'])

export const malaysianStateSchema = z.enum([
  'johor',
  'kedah',
  'kelantan',
  'kuala_lumpur',
  'labuan',
  'melaka',
  'negeri_sembilan',
  'pahang',
  'penang',
  'perak',
  'perlis',
  'putrajaya',
  'sabah',
  'sarawak',
  'selangor',
  'terengganu',
  'klang_valley',
])

export const eventStatusSchema = z.enum([
  'draft',
  'scheduled',
  'postponed',
  'cancelled',
  'completed',
])

// Field schema
export const fieldSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  category: z.string().nullable(),
})

// Full event schema (from database)
export const eventSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  startDate: z.string(), // ISO date string
  endDate: z.string(), // ISO date string
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  eventType: eventTypeSchema,
  region: malaysianStateSchema,
  venueName: z.string().nullable(),
  venueAddress: z.string().nullable(),
  venueId: z.string().nullable(),
  externalUrl: z.string().url().nullable(),
  status: eventStatusSchema,
  registrationOpenDate: z.string().nullable(),
  registrationCloseDate: z.string().nullable(),
  candidateCapacity: z.number().int().positive().nullable(),
  candidateRegistered: z.number().int().nonnegative(),
  employerCapacity: z.number().int().positive().nullable(),
  employerRegistered: z.number().int().nonnegative(),
  cancellationReason: z.string().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  postponedFromDate: z.string().nullable(),
  movedFromEventId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  publishedAt: z.string().datetime().nullable(),
  archivedAt: z.string().datetime().nullable(),
})

// Event response schema (for API responses with related data)
export const eventResponseSchema = eventSchema.extend({
  fields: z.array(fieldSchema),
  isMultiDay: z.boolean(),
  durationDays: z.number().int().positive(),
})

// Query filter schema
export const eventFiltersSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2030).optional(),
  region: malaysianStateSchema.optional(),
  eventType: eventTypeSchema.optional(),
  fieldId: z.coerce.number().int().positive().optional(),
  status: eventStatusSchema.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// Export types
export type Event = z.infer<typeof eventSchema>
export type EventResponse = z.infer<typeof eventResponseSchema>
export type EventFilters = z.infer<typeof eventFiltersSchema>
export type EventType = z.infer<typeof eventTypeSchema>
export type MalaysianState = z.infer<typeof malaysianStateSchema>
export type EventStatus = z.infer<typeof eventStatusSchema>
export type Field = z.infer<typeof fieldSchema>
