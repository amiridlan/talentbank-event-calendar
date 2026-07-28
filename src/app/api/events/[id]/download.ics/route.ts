import { NextRequest, NextResponse } from 'next/server'
import { db, events, eventFields, fields } from '@/db'
import { eq } from 'drizzle-orm'
import { generateEventICS } from '@/lib/calendar/ics-generator'
import type { EventResponse } from '@/lib/validations/event'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Fetch event with fields
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Fetch event fields
    const eventFieldsData = await db
      .select({
        field: fields,
      })
      .from(eventFields)
      .innerJoin(fields, eq(eventFields.fieldId, fields.id))
      .where(eq(eventFields.eventId, eventId))

    // Calculate multi-day properties
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    const durationMs = endDate.getTime() - startDate.getTime()
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1
    const isMultiDay = durationDays > 1

    // Transform to EventResponse format
    const eventResponse: EventResponse = {
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

    // Generate ICS file content
    const icsContent = generateEventICS(eventResponse)

    // Create a safe filename from event name
    const safeFileName = event.name
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase()

    // Return as downloadable .ics file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeFileName}.ics"`,
      },
    })
  } catch (error) {
    console.error('ICS generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate calendar file' },
      { status: 500 }
    )
  }
}
