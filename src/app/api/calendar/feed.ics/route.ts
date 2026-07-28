import { NextRequest, NextResponse } from 'next/server'
import { db, events, eventFields, fields } from '@/db'
import { and, eq, gte, inArray, sql } from 'drizzle-orm'
import { generateMultipleEventsICS } from '@/lib/calendar/ics-generator'
import type { EventResponse } from '@/lib/validations/event'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const region = searchParams.get('region')
    const eventType = searchParams.get('eventType')
    const fieldId = searchParams.get('fieldId')

    // Build query conditions
    const conditions = [
      // Only include published, scheduled or postponed events
      sql`${events.status} IN ('scheduled', 'postponed')`,
      sql`${events.publishedAt} IS NOT NULL`,
      // Only future events (or events happening today)
      gte(events.endDate, new Date().toISOString().split('T')[0]),
    ]

    if (region) {
      conditions.push(eq(events.region, region as any))
    }

    if (eventType) {
      conditions.push(eq(events.eventType, eventType as any))
    }

    // Fetch events
    let eventsQuery = db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(events.startDate)

    const eventsData = await eventsQuery

    // Filter by field if specified
    let filteredEvents = eventsData
    if (fieldId) {
      const fieldIdNum = parseInt(fieldId)
      const eventIds = eventsData.map((e) => e.id)

      if (eventIds.length > 0) {
        const eventsWithField = await db
          .select({ eventId: eventFields.eventId })
          .from(eventFields)
          .where(
            and(
              inArray(eventFields.eventId, eventIds),
              eq(eventFields.fieldId, fieldIdNum)
            )
          )

        const eventIdsWithField = new Set(
          eventsWithField.map((ef) => ef.eventId)
        )
        filteredEvents = eventsData.filter((e) =>
          eventIdsWithField.has(e.id)
        )
      } else {
        filteredEvents = []
      }
    }

    // Fetch fields for all events
    const eventResponses: EventResponse[] = await Promise.all(
      filteredEvents.map(async (event) => {
        const eventFieldsData = await db
          .select({
            field: fields,
          })
          .from(eventFields)
          .innerJoin(fields, eq(eventFields.fieldId, fields.id))
          .where(eq(eventFields.eventId, event.id))

        // Calculate multi-day properties
        const startDate = new Date(event.startDate)
        const endDate = new Date(event.endDate)
        const durationMs = endDate.getTime() - startDate.getTime()
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1
        const isMultiDay = durationDays > 1

        return {
          id: event.id,
          name: event.name,
          slug: event.slug,
          eventType: event.eventType,
          startDate: event.startDate,
          endDate: event.endDate,
          startTime: event.startTime,
          endTime: event.endTime,
          isMultiDay,
          durationDays,
          region: event.region,
          venueName: event.venueName,
          venueAddress: event.venueAddress,
          venueId: event.venueId,
          externalUrl: event.externalUrl,
          status: event.status,
          postponedFromDate: event.postponedFromDate,
          movedFromEventId: event.movedFromEventId,
          candidateCapacity: event.candidateCapacity,
          candidateRegistered: event.candidateRegistered ?? 0,
          employerCapacity: event.employerCapacity,
          employerRegistered: event.employerRegistered ?? 0,
          cancellationReason: event.cancellationReason,
          cancelledAt: event.cancelledAt?.toISOString() || null,
          fields: eventFieldsData.map((ef) => ef.field),
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
          createdBy: event.createdBy,
          updatedBy: event.updatedBy,
          publishedAt: event.publishedAt?.toISOString() || null,
          archivedAt: event.archivedAt?.toISOString() || null,
        }
      })
    )

    // Generate calendar name based on filters
    const filterParts = []
    if (region) {
      filterParts.push(region.replace('_', ' '))
    }
    if (eventType) {
      filterParts.push(eventType)
    }
    if (fieldId) {
      const [field] = await db
        .select()
        .from(fields)
        .where(eq(fields.id, parseInt(fieldId)))
        .limit(1)
      if (field) {
        filterParts.push(field.name)
      }
    }

    const calendarName =
      filterParts.length > 0
        ? `TalentCorp Career Fairs - ${filterParts.join(', ')}`
        : 'TalentCorp Career Fairs'

    // Generate ICS content
    const icsContent = generateMultipleEventsICS(eventResponses, calendarName)

    // Return as .ics file with proper headers for webcal subscription
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="talentcorp-events.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('Calendar feed error:', error)
    return NextResponse.json(
      { error: 'Failed to generate calendar feed' },
      { status: 500 }
    )
  }
}
