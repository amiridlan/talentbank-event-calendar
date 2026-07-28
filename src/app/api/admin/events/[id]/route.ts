import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, events } from '@/db'
import { eq } from 'drizzle-orm'

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

    // Update event - convert dates to ISO strings
    const [updatedEvent] = await db
      .update(events)
      .set({
        name: body.name,
        slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        eventType: body.eventType,
        startDate: new Date(body.startDate).toISOString().split('T')[0],
        endDate: new Date(body.endDate).toISOString().split('T')[0],
        region: body.region,
        venueName: body.venueName,
        externalUrl: body.externalUrl || null,
        candidateCapacity: body.candidateCapacity,
        employerCapacity: body.employerCapacity,
        status: body.status,
        registrationOpenDate: new Date(body.registrationOpenDate).toISOString().split('T')[0],
        registrationCloseDate: new Date(body.registrationCloseDate).toISOString().split('T')[0],
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
