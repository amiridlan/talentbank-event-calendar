import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { events } from '@/db/schema'
import { notFound } from 'next/navigation'
import EditEventForm from './edit-form'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
  })

  if (!event) {
    notFound()
  }

  return <EditEventForm event={event} />
}
