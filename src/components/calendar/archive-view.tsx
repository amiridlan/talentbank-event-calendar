import { format, parseISO } from 'date-fns'
import { Calendar } from 'lucide-react'
import { EventCard } from './event-card'
import type { EventResponse } from '@/lib/validations/event'
import { db, events, fields, eventFields } from '@/db'
import { eq, and, like, desc } from 'drizzle-orm'

async function getArchivedEvents(searchParams: {
  [key: string]: string | string[] | undefined
}) {
  // Build where conditions
  const conditions = []

  if (searchParams.year) {
    const year = searchParams.year as string
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`
    conditions.push(
      eq(events.startDate, yearStart) // You may want to adjust this based on your needs
    )
  }

  if (searchParams.region) {
    conditions.push(eq(events.region, searchParams.region as string))
  }

  if (searchParams.eventType) {
    conditions.push(eq(events.eventType, searchParams.eventType as string))
  }

  // Filter for completed events only
  conditions.push(eq(events.status, 'completed'))

  if (searchParams.search) {
    conditions.push(like(events.name, `%${searchParams.search}%`))
  }

  // Query events
  const eventsData = await db
    .select()
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(events.startDate))

  // Get related fields for each event
  const eventsWithFields = await Promise.all(
    eventsData.map(async (event) => {
      const eventFieldsData = await db
        .select({
          id: fields.id,
          name: fields.name,
          slug: fields.slug,
          category: fields.category,
        })
        .from(eventFields)
        .innerJoin(fields, eq(eventFields.fieldId, fields.id))
        .where(eq(eventFields.eventId, event.id))

      // Calculate multi-day info
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      const durationDays =
        Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      const isMultiDay = durationDays > 1

      return {
        ...event,
        startDate: event.startDate,
        endDate: event.endDate,
        postponedFromDate: event.postponedFromDate || null,
        registrationOpenDate: event.registrationOpenDate || null,
        registrationCloseDate: event.registrationCloseDate || null,
        startTime: event.startTime || null,
        endTime: event.endTime || null,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        publishedAt: event.publishedAt?.toISOString() || null,
        archivedAt: event.archivedAt?.toISOString() || null,
        cancelledAt: event.cancelledAt?.toISOString() || null,
        externalUrl: event.externalUrl || null,
        fields: eventFieldsData,
        isMultiDay,
        durationDays,
      } as EventResponse
    })
  )

  return eventsWithFields
}

export async function ArchiveView({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const events = await getArchivedEvents(searchParams)

  // Filter to only include past events (endDate < today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pastEvents = events.filter((event) => {
    const endDate = parseISO(event.endDate)
    return endDate < today
  })

  // Group events by year and month
  const groupedEvents = pastEvents.reduce(
    (acc, event) => {
      const date = parseISO(event.startDate)
      const year = date.getFullYear()
      const month = format(date, 'MMMM')
      const key = `${year}-${month}`

      if (!acc[key]) {
        acc[key] = {
          year,
          month,
          events: [],
        }
      }

      acc[key].events.push(event)
      return acc
    },
    {} as Record<
      string,
      { year: number; month: string; events: EventResponse[] }
    >
  )

  // Sort by date (most recent first)
  const sortedGroups = Object.values(groupedEvents).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return new Date(`${b.month} 1`).getMonth() - new Date(`${a.month} 1`).getMonth()
  })

  if (pastEvents.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-xl font-bold text-gray-900">
          No archived events found
        </h3>
        <p className="mt-2 text-base text-gray-700">
          {searchParams.search || searchParams.region || searchParams.eventType
            ? 'Try adjusting your filters to see more results.'
            : 'Past events will appear here once they have concluded.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Statistics summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Archive Statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">Total Past Events</p>
            <p className="mt-1 text-3xl font-bold text-blue-900">
              {pastEvents.length}
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-sm font-semibold text-purple-700">Total Candidates</p>
            <p className="mt-1 text-3xl font-bold text-purple-900">
              {pastEvents.reduce(
                (sum, e) => sum + (e.candidateRegistered || 0),
                0
              )}
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-700">Total Employers</p>
            <p className="mt-1 text-3xl font-bold text-green-900">
              {pastEvents.reduce(
                (sum, e) => sum + (e.employerRegistered || 0),
                0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Grouped events */}
      {sortedGroups.map((group) => (
        <section key={`${group.year}-${group.month}`}>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            {group.month} {group.year}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
