import { describe, it, expect } from 'vitest'
import { generateEventICS } from './ics-generator'
import type { EventResponse } from '@/lib/validations/event'

const mockEvent: EventResponse = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'UiTM Career Fair 2025',
  slug: 'uitm-career-fair-2025',
  eventType: 'campus',
  startDate: '2025-02-15',
  endDate: '2025-02-15',
  startTime: null,
  endTime: null,
  isMultiDay: false,
  durationDays: 1,
  region: 'selangor',
  venueName: 'UiTM Shah Alam',
  venueAddress: 'Shah Alam, Selangor',
  venueId: 'uitm-shah-alam',
  externalUrl: 'https://uitm.edu.my/career-fair',
  status: 'scheduled',
  postponedFromDate: null,
  movedFromEventId: null,
  candidateCapacity: 500,
  candidateRegistered: 150,
  employerCapacity: 50,
  employerRegistered: 20,
  cancellationReason: null,
  cancelledAt: null,
  fields: [
    { id: 1, name: 'Engineering', slug: 'engineering', category: 'STEM' },
    { id: 2, name: 'Information Technology', slug: 'it', category: 'Technology' },
  ],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  createdBy: null,
  updatedBy: null,
  publishedAt: '2025-01-01T00:00:00.000Z',
  archivedAt: null,
}

describe('ICS Generator', () => {
  it('generates valid ICS for a single event', () => {
    const ics = generateEventICS(mockEvent)

    // Check for required ICS components
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')

    // Check event details
    expect(ics).toContain('SUMMARY:UiTM Career Fair 2025')
    expect(ics).toContain('LOCATION:UiTM Shah Alam')
    expect(ics).toContain('STATUS:CONFIRMED')

    // Check for fields in description
    expect(ics).toContain('Engineering')
    expect(ics).toContain('Information Technology')

    // Check for capacity info
    expect(ics).toContain('150/500')
    expect(ics).toContain('20/50')
  })

  it('handles cancelled events correctly', () => {
    const cancelledEvent: EventResponse = {
      ...mockEvent,
      status: 'cancelled',
      cancelledAt: '2025-01-15T00:00:00.000Z',
      cancellationReason: 'Postponed due to scheduling conflict',
    }

    const ics = generateEventICS(cancelledEvent)

    expect(ics).toContain('STATUS:CANCELLED')
  })

  it('handles events without capacity', () => {
    const noCapacityEvent: EventResponse = {
      ...mockEvent,
      candidateCapacity: null,
      employerCapacity: null,
    }

    const ics = generateEventICS(noCapacityEvent)

    // Should still generate valid ICS
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
  })

  it('formats location correctly with region', () => {
    const klangValleyEvent: EventResponse = {
      ...mockEvent,
      region: 'klang_valley',
    }

    const ics = generateEventICS(klangValleyEvent)

    expect(ics).toContain('klang valley')
  })
})
