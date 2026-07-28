import { format, parseISO } from 'date-fns'
import { Calendar } from 'lucide-react'
import { EventCard } from './event-card'
import type { EventResponse } from '@/lib/validations/event'

async function getArchivedEvents(searchParams: {
  [key: string]: string | string[] | undefined
}) {
  const params = new URLSearchParams()

  // Add filter parameters
  if (searchParams.year) params.set('year', searchParams.year as string)
  if (searchParams.region) params.set('region', searchParams.region as string)
  if (searchParams.eventType)
    params.set('eventType', searchParams.eventType as string)
  if (searchParams.search) params.set('search', searchParams.search as string)

  // Filter for past events only
  params.set('status', 'completed')

  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/events?${params.toString()}`

  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error('Failed to fetch archived events')
  }

  const data = await res.json()
  return data.events as EventResponse[]
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
