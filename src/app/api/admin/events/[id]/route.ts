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

    // Create full datetime objects for overlap comparison
    const newStartDateTime = new Date(`${startDateTime.date}T${startDateTime.time}`)
    const newEndDateTime = new Date(`${endDateTime.date}T${endDateTime.time}`)

    // Check for overlapping events (excluding current event being updated)
    // Two events overlap if: newStart < existingEnd AND newEnd > existingStart
    const allEvents = await db.select().from(events).where(ne(events.id, id))

    const overlappingEvents = allEvents.filter((event) => {
      if (!event.startDate || !event.endDate || !event.startTime || !event.endTime) {
        return false
      }

      const existingStart = new Date(`${event.startDate}T${event.startTime}`)
      const existingEnd = new Date(`${event.endDate}T${event.endTime}`)

      // Check if the time ranges overlap
      return newStartDateTime < existingEnd && newEndDateTime > existingStart
    })

    if (overlappingEvents.length > 0) {
      const conflictEvent = overlappingEvents[0]
      return NextResponse.json(
        {
          message: `This event overlaps with an existing event: ${conflictEvent.name} (${conflictEvent.startDate} ${conflictEvent.startTime} - ${conflictEvent.endDate} ${conflictEvent.endTime})`,
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
