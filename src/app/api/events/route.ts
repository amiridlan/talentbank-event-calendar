import { NextRequest, NextResponse } from 'next/server'
import { db, events, fields, eventFields } from '@/db'
import { eq, and, gte, lte, like, sql, desc } from 'drizzle-orm'
import { eventFiltersSchema, eventResponseSchema } from '@/lib/validations/event'

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const filters = eventFiltersSchema.parse(searchParams)

    // Build where conditions
    const conditions = []

    if (filters.year) {
      // Filter events that fall within the specified year
      const yearStart = `${filters.year}-01-01`
      const yearEnd = `${filters.year}-12-31`
      conditions.push(
        sql`${events.startDate} <= ${yearEnd} AND ${events.endDate} >= ${yearStart}`
      )
    }

    if (filters.region) {
      conditions.push(eq(events.region, filters.region))
    }

    if (filters.eventType) {
      conditions.push(eq(events.eventType, filters.eventType))
    }

    if (filters.status) {
      conditions.push(eq(events.status, filters.status))
    } else {
      // By default, only show scheduled events (not drafts or archived)
      conditions.push(eq(events.status, 'scheduled'))
    }

    if (filters.search) {
      conditions.push(like(events.name, `%${filters.search}%`))
    }

    // Calculate pagination
    const offset = (filters.page - 1) * filters.limit

    // Query events with pagination
    const eventsData = await db
      .select()
      .from(events)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(events.startDate))
      .limit(filters.limit)
      .offset(offset)

    // Get related fields for each event
    const eventsWithFields = await Promise.all(
      eventsData.map(async (event) => {
        // Query fields for this event
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

        // Filter by fieldId if specified
        if (filters.fieldId) {
          const hasField = eventFieldsData.some((f) => f.id === filters.fieldId)
          if (!hasField) return null
        }

        // Calculate multi-day info
        const startDate = new Date(event.startDate)
        const endDate = new Date(event.endDate)
        const durationDays =
          Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const isMultiDay = durationDays > 1

        return {
          ...event,
          // Convert dates to ISO strings for JSON serialization
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
        }
      })
    )

    // Filter out nulls (events that didn't match fieldId filter)
    const filteredEvents = eventsWithFields.filter((e) => e !== null)

    // Validate response
    const validatedEvents = filteredEvents.map((event) =>
      eventResponseSchema.parse(event)
    )

    // Return response
    return NextResponse.json({
      events: validatedEvents,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: validatedEvents.length,
      },
    })
  } catch (error) {
    console.error('API Error:', error)

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
