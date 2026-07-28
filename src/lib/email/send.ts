import { resend, FROM_EMAIL, isEmailEnabled } from './client'
import { render } from '@react-email/render'
import RegistrationConfirmationEmail from '@/emails/registration-confirmation'
import EventCancellationEmail from '@/emails/event-cancellation'
import EventReminderEmail from '@/emails/event-reminder'

interface SendRegistrationConfirmationParams {
  to: string
  name: string
  eventName: string
  eventSlug: string
  startDate: string
  endDate: string
  venueName: string | null
  venueAddress: string | null
  region: string
  registrationType: 'candidate' | 'employer'
  status: 'confirmed' | 'waitlisted'
  waitlistPosition?: number | null
  boothCount?: number | null
}

export async function sendRegistrationConfirmation(
  params: SendRegistrationConfirmationParams
) {
  if (!isEmailEnabled()) {
    console.log('Email disabled - would have sent registration confirmation to:', params.to)
    return { success: false, messageId: null, disabled: true }
  }

  try {
    const emailHtml = await render(
      RegistrationConfirmationEmail(params),
      { pretty: true }
    )

    const subject =
      params.status === 'confirmed'
        ? `Registration Confirmed: ${params.eventName}`
        : `Waitlist Confirmation: ${params.eventName}`

    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send registration confirmation:', error)
      throw new Error(`Email send failed: ${error.message}`)
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Error in sendRegistrationConfirmation:', error)
    throw error
  }
}

interface SendEventCancellationParams {
  to: string
  name: string
  eventName: string
  eventSlug: string
  startDate: string
  endDate: string
  cancellationReason: string | null
  registrationType: 'candidate' | 'employer'
}

export async function sendEventCancellation(
  params: SendEventCancellationParams
) {
  if (!isEmailEnabled()) {
    console.log('Email disabled - would have sent cancellation email to:', params.to)
    return { success: false, messageId: null, disabled: true }
  }

  try {
    const emailHtml = await render(
      EventCancellationEmail(params),
      { pretty: true }
    )

    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Event Cancelled: ${params.eventName}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send cancellation email:', error)
      throw new Error(`Email send failed: ${error.message}`)
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Error in sendEventCancellation:', error)
    throw error
  }
}

interface SendEventReminderParams {
  to: string
  name: string
  eventName: string
  eventSlug: string
  startDate: string
  endDate: string
  venueName: string | null
  venueAddress: string | null
  region: string
  registrationType: 'candidate' | 'employer'
  boothCount?: number | null
}

export async function sendEventReminder(params: SendEventReminderParams) {
  if (!isEmailEnabled()) {
    console.log('Email disabled - would have sent reminder email to:', params.to)
    return { success: false, messageId: null, disabled: true }
  }

  try {
    const emailHtml = await render(
      EventReminderEmail(params),
      { pretty: true }
    )

    const { data, error} = await resend!.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Reminder: ${params.eventName} is in 7 days`,
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send reminder email:', error)
      throw new Error(`Email send failed: ${error.message}`)
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Error in sendEventReminder:', error)
    throw error
  }
}

/**
 * Send bulk emails to multiple recipients
 * Useful for sending cancellation emails to all registered users
 */
export async function sendBulkEmails<T>(
  recipients: Array<{ email: string } & T>,
  emailFunction: (recipient: T & { email: string }) => Promise<{ success: boolean; messageId?: string }>
) {
  const results = []

  // Send emails in batches to avoid rate limiting
  const BATCH_SIZE = 10
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.allSettled(
      batch.map((recipient) => emailFunction(recipient))
    )
    results.push(...batchResults)

    // Wait between batches to respect rate limits
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  const successful = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return {
    total: recipients.length,
    successful,
    failed,
    results,
  }
}
