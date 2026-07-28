import { pgEnum } from 'drizzle-orm/pg-core'

// Event type classification
export const eventTypeEnum = pgEnum('event_type', [
  'campus', // University career fair
  'sector', // Industry-specific (tech, engineering, BAFI, etc.)
  'public', // Open to all
  'awards', // Gala/awards events
])

// Malaysian states and territories
export const malaysianStateEnum = pgEnum('malaysian_state', [
  'johor',
  'kedah',
  'kelantan',
  'kuala_lumpur',
  'labuan',
  'melaka', // Fixed from "Melacca"
  'negeri_sembilan',
  'pahang',
  'penang',
  'perak',
  'perlis',
  'putrajaya',
  'sabah',
  'sarawak',
  'selangor',
  'terengganu', // Fixed from "Terrengganu"
  'klang_valley', // Special: KL + Selangor combined
])

// Event lifecycle status
export const eventStatusEnum = pgEnum('event_status', [
  'draft', // Being created, not visible to public
  'scheduled', // Published and upcoming
  'postponed', // Delayed to a future date
  'cancelled', // Not happening
  'completed', // Past event
])

// Type of change made to an event (for audit trail)
export const changeTypeEnum = pgEnum('change_type', [
  'created',
  'updated',
  'postponed',
  'cancelled',
  'restored',
  'capacity_updated',
  'date_changed',
])

// Registration participant type
export const registrationTypeEnum = pgEnum('registration_type', [
  'candidate', // Job seeker attending the fair
  'employer', // Company booking a booth
])

// Registration status in the signup flow
export const registrationStatusEnum = pgEnum('registration_status', [
  'pending', // Awaiting confirmation
  'confirmed', // Spot secured
  'waitlisted', // On waitlist (event full)
  'cancelled', // Registration cancelled
])
