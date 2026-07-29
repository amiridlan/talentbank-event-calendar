import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, events } from '@/db'
import { and, eq, ne } from 'drizzle-orm'

/**
 * Helper function to extract date and time from datetime-local string
 */
function extractDateTimeComponents(datetimeStr: string) {
  const datetime = new Date(datetimeStr)
  const date = datetime.toISOString().split('T')[0]
  const time = datetime.toTimeString().split(' ')[0].substring(0, 8) // HH:MM:SS format
  return { date, time }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check role - only admin and editor can update events
    if (session.user.role === 'viewer') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Extract date and time components for event start/end
    const startDateTime = extractDateTimeComponents(body.startDate)
    const endDateTime = extractDateTimeComponents(body.endDate)

    // Extract only date for registration dates (they don't have time fields in DB)
    const regOpenDate = new Date(body.registrationOpenDate).toISOString().split('T')[0]
    const regCloseDate = new Date(body.registrationCloseDate).toISOString().split('T')[0]

    // Check for existing events with the same start date and time (excluding current event)
    const existingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          ne(events.id, id),
          eq(events.startDate, startDateTime.date),
          eq(events.startTime, startDateTime.time)
        )
      )

    if (existingEvents.length > 0) {
      return NextResponse.json(
        {
          message: `An event already exists at this date and time: ${existingEvents[0].name}`,
        },
        { status: 409 }
      )
    }

    // Update event - store both date and time
    const [updatedEvent] = await db
      .update(events)
      .set({
        name: body.name,
        slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        eventType: body.eventType,
        startDate: startDateTime.date,
        endDate: endDateTime.date,
        startTime: startDateTime.time,
        endTime: endDateTime.time,
        region: body.region,
        venueName: body.venueName,
        externalUrl: body.externalUrl || null,
        candidateCapacity: body.candidateCapacity,
        employerCapacity: body.employerCapacity,
        status: body.status,
        registrationOpenDate: regOpenDate,
        registrationCloseDate: regCloseDate,
      })
      .where(eq(events.id, id))
      .returning()

    if (!updatedEvent) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Failed to update event:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check role - only admin can delete events
    if (session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    await db.delete(events).where(eq(events.id, id))

    return NextResponse.json({ message: 'Event deleted' })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
