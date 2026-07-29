import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import {
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  Clock,
  ArrowLeft,
  Users,
  Download,
} from 'lucide-react'
import type { EventResponse } from '@/lib/validations/event'
import { SkipLink } from '@/components/ui/skip-link'
import { db, events, fields, eventFields } from '@/db'
import { eq } from 'drizzle-orm'

async function getEvent(slug: string): Promise<EventResponse | null> {
  try {
    // Query event by slug
    const eventData = await db
      .select()
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1)

    if (eventData.length === 0) return null

    const event = eventData[0]

    // Get related fields
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
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  return {
    title: `${event.name} | Talentbank Career Fairs`,
    description: `${event.name} - ${format(parseISO(event.startDate), 'MMMM d, yyyy')}. Register for this ${event.eventType} career fair.`,
  }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  const startDate = parseISO(event.startDate)
  const endDate = parseISO(event.endDate)

  const dateDisplay = event.isMultiDay
    ? `${format(startDate, 'MMMM d')} - ${format(endDate, 'd, yyyy')}`
    : format(startDate, 'MMMM d, yyyy')

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: event.venueName
      ? {
          '@type': 'Place',
          name: event.venueName,
          address: event.venueAddress || undefined,
        }
      : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Talentbank',
      url: 'https://www.talentbank.io',
    },
    description: `${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} career fair featuring opportunities in ${event.fields.map((f) => f.name).join(', ')}`,
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        <SkipLink />
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to calendar
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl">
            {/* Event header */}
            <div className="mb-8">
              <div className="mb-4">
                <span className="inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800">
                  {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                </span>
              </div>

              <h1 className="mb-4 text-4xl font-bold text-gray-900">{event.name}</h1>

              <div className="flex flex-wrap gap-6 text-gray-600">
                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">{dateDisplay}</span>
                  {event.isMultiDay && (
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {event.durationDays} days
                    </span>
                  )}
                </div>

                {/* Time */}
                {event.startTime && event.endTime ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-5 w-5" />
                    <span className="italic">Time TBA</span>
                  </div>
                )}

                {/* State */}
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="capitalize">{event.region.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mb-8 flex flex-wrap gap-4">
              <a
                href={`/api/events/${event.id}/download.ics`}
                download
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                Add to Calendar
              </a>
              {event.externalUrl && (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Visit Event Website
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </div>

            {/* Event details card */}
            <div className="rounded-lg border border-gray-200 bg-white p-8">
              {/* Venue */}
              <div className="mb-8">
                <h2 className="mb-3 text-xl font-semibold text-gray-900">Venue</h2>
                {event.venueName ? (
                  <div>
                    <p className="text-lg text-gray-900">{event.venueName}</p>
                    {event.venueAddress ? (
                      <p className="mt-1 text-gray-600">{event.venueAddress}</p>
                    ) : (
                      <p className="mt-1 italic text-gray-500">Full address TBA</p>
                    )}
                  </div>
                ) : (
                  <p className="italic text-gray-500">Venue to be announced</p>
                )}
              </div>

              {/* Fields/Industries */}
              {event.fields.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-3 text-xl font-semibold text-gray-900">
                    Industries & Fields
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {event.fields.map((field) => (
                      <span
                        key={field.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700"
                      >
                        <Building2 className="h-4 w-4" />
                        {field.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity info */}
              {(event.candidateCapacity || event.employerCapacity) && (
                <div className="mb-8">
                  <h2 className="mb-3 text-xl font-semibold text-gray-900">Capacity</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {event.candidateCapacity && (
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="flex items-center gap-2 text-blue-900">
                          <Users className="h-5 w-5" />
                          <span className="font-semibold">Candidates</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-blue-900">
                          {event.candidateRegistered} / {event.candidateCapacity}
                        </p>
                        <p className="text-sm text-blue-700">seats registered</p>
                      </div>
                    )}
                    {event.employerCapacity && (
                      <div className="rounded-lg bg-purple-50 p-4">
                        <div className="flex items-center gap-2 text-purple-900">
                          <Building2 className="h-5 w-5" />
                          <span className="font-semibold">Employers</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-purple-900">
                          {event.employerRegistered} / {event.employerCapacity}
                        </p>
                        <p className="text-sm text-purple-700">booths registered</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
