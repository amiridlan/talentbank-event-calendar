import { NextRequest, NextResponse } from 'next/server'
import { db, events, registrations } from '@/db'
import { eq, and, count } from 'drizzle-orm'
import { registrationSchema } from '@/lib/validations/registration'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = registrationSchema.parse({
      ...body,
      eventId,
    })

    // Get event with current registration counts
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if already registered
    const [existing] = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, eventId),
          eq(registrations.email, validatedData.email),
          eq(registrations.registrationType, validatedData.registrationType)
        )
      )
      .limit(1)

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      )
    }

    // Determine if registration should be confirmed or waitlisted
    let status: 'confirmed' | 'waitlisted' = 'confirmed'
    let waitlistPosition: number | null = null

    if (validatedData.registrationType === 'candidate') {
      const registered = event.candidateRegistered ?? 0
      if (
        event.candidateCapacity &&
        registered >= event.candidateCapacity
      ) {
        // Full - add to waitlist
        status = 'waitlisted'
        const [waitlistCount] = await db
          .select({ count: count() })
          .from(registrations)
          .where(
            and(
              eq(registrations.eventId, eventId),
              eq(registrations.registrationType, 'candidate'),
              eq(registrations.status, 'waitlisted')
            )
          )
        waitlistPosition = waitlistCount.count + 1
      }
    } else {
      // Employer
      const requestedBooths = validatedData.boothCount || 1
      const employerRegistered = event.employerRegistered ?? 0
      const availableBooths = event.employerCapacity
        ? event.employerCapacity - employerRegistered
        : Infinity

      if (event.employerCapacity && requestedBooths > availableBooths) {
        status = 'waitlisted'
        const [waitlistCount] = await db
          .select({ count: count() })
          .from(registrations)
          .where(
            and(
              eq(registrations.eventId, eventId),
              eq(registrations.registrationType, 'employer'),
              eq(registrations.status, 'waitlisted')
            )
          )
        waitlistPosition = waitlistCount.count + 1
      }
    }

    // Create registration
    const [registration] = await db
      .insert(registrations)
      .values({
        eventId,
        registrationType: validatedData.registrationType,
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone || null,
        organization: validatedData.organization || null,
        boothCount: validatedData.boothCount || null,
        consentDataProcessing: validatedData.consentDataProcessing,
        consentMarketing: validatedData.consentMarketing || false,
        consentedAt: new Date(),
        status,
        waitlistedAt: status === 'waitlisted' ? new Date() : null,
      })
      .returning()

    // Update event registration count if confirmed
    if (status === 'confirmed') {
      if (validatedData.registrationType === 'candidate') {
        const currentRegistered = event.candidateRegistered ?? 0
        await db
          .update(events)
          .set({ candidateRegistered: currentRegistered + 1 })
          .where(eq(events.id, eventId))
      } else {
        const currentRegistered = event.employerRegistered ?? 0
        await db
          .update(events)
          .set({
            employerRegistered:
              currentRegistered + (validatedData.boothCount || 1),
          })
          .where(eq(events.id, eventId))
      }
    }

    // Email sending removed - registrations work without email notifications
    // If you need to re-enable emails in the future, add email sending logic here

    return NextResponse.json({
      id: registration.id,
      eventId: registration.eventId,
      registrationType: registration.registrationType,
      email: registration.email,
      name: registration.name,
      status: registration.status,
      waitlistPosition,
      registeredAt: registration.registeredAt.toISOString(),
      message:
        status === 'confirmed'
          ? 'Registration confirmed!'
          : `Added to waitlist (position ${waitlistPosition})`,
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid registration data', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}
