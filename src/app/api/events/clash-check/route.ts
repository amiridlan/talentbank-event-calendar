import { NextRequest, NextResponse } from 'next/server'
import { db, events, eventFields, fields } from '@/db'
import { and, ne, sql, inArray } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, region, fieldIds, excludeEventId, windowDays = 7 } = body

    if (!startDate || !endDate || !region) {
      return NextResponse.json(
        { error: 'Missing required fields: startDate, endDate, region' },
        { status: 400 }
      )
    }

    // Find potential soft clashes:
    // 1. Same region
    // 2. Date ranges overlap or within windowDays
    // 3. Share at least one field
    // 4. Status is scheduled or postponed (not cancelled/draft)

    const conditions = [
      sql`${events.region} = ${region}`,
      sql`${events.status} IN ('scheduled', 'postponed')`,
    ]

    // Exclude current event if editing
    if (excludeEventId) {
      conditions.push(ne(events.id, excludeEventId))
    }

    // Date overlap or proximity check
    // Events that overlap or are within windowDays of each other
    const dateStart = new Date(startDate)
    const dateEnd = new Date(endDate)
    const windowStart = new Date(dateStart)
    windowStart.setDate(windowStart.getDate() - windowDays)
    const windowEnd = new Date(dateEnd)
    windowEnd.setDate(windowEnd.getDate() + windowDays)

    conditions.push(
      sql`${events.startDate} <= ${windowEnd.toISOString().split('T')[0]}
          AND ${events.endDate} >= ${windowStart.toISOString().split('T')[0]}`
    )

    // Get potentially clashing events
    const potentialClashes = await db
      .select()
      .from(events)
      .where(and(...conditions))

    // Filter by shared fields
    const clashesWithFields = await Promise.all(
      potentialClashes.map(async (event) => {
        // Get this event's fields
        const eventFieldsData = await db
          .select({ fieldId: eventFields.fieldId })
          .from(eventFields)
          .where(sql`${eventFields.eventId} = ${event.id}`)

        const eventFieldIds = eventFieldsData.map((ef) => ef.fieldId)

        // Check if any fields overlap
        const hasSharedField =
          fieldIds && fieldIds.length > 0
            ? eventFieldIds.some((id: number) => fieldIds.includes(id))
            : false

        if (hasSharedField || !fieldIds || fieldIds.length === 0) {
          // Get field details
          const fieldDetails =
            eventFieldIds.length > 0
              ? await db
                  .select()
                  .from(fields)
                  .where(inArray(fields.id, eventFieldIds))
              : []

          return {
            ...event,
            fields: fieldDetails,
            sharedFields: fieldIds
              ? fieldDetails.filter((f) => fieldIds.includes(f.id))
              : [],
          }
        }

        return null
      })
    )

    const clashes = clashesWithFields.filter((c) => c !== null)

    // Categorize clashes
    const hardClashes = clashes.filter(
      (c) =>
        c.venueId &&
        body.venueId &&
        c.venueId === body.venueId &&
        // Date ranges actually overlap (not just within window)
        new Date(c.startDate) <= dateEnd &&
        new Date(c.endDate) >= dateStart
    )

    const softClashes = clashes.filter(
      (c) => !hardClashes.find((h) => h.id === c.id)
    )

    return NextResponse.json({
      hardClashes: hardClashes.map((c) => ({
        ...c,
        startDate: c.startDate,
        endDate: c.endDate,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        publishedAt: c.publishedAt?.toISOString() || null,
        archivedAt: c.archivedAt?.toISOString() || null,
        cancelledAt: c.cancelledAt?.toISOString() || null,
      })),
      softClashes: softClashes.map((c) => ({
        ...c,
        startDate: c.startDate,
        endDate: c.endDate,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        publishedAt: c.publishedAt?.toISOString() || null,
        archivedAt: c.archivedAt?.toISOString() || null,
        cancelledAt: c.cancelledAt?.toISOString() || null,
      })),
      hasClashes: hardClashes.length > 0 || softClashes.length > 0,
    })
  } catch (error) {
    console.error('Clash check error:', error)
    return NextResponse.json(
      { error: 'Failed to check for clashes' },
      { status: 500 }
    )
  }
}
