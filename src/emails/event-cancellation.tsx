import { Html } from '@react-email/html'
import { Head } from '@react-email/head'
import { Preview } from '@react-email/preview'
import { Body } from '@react-email/body'
import { Container } from '@react-email/container'
import { Section } from '@react-email/section'
import { Text } from '@react-email/text'
import { Button } from '@react-email/button'
import { Hr } from '@react-email/hr'
import { Link } from '@react-email/link'
import { format, parseISO } from 'date-fns'

interface EventCancellationEmailProps {
  name: string
  eventName: string
  eventSlug: string
  startDate: string
  endDate: string
  cancellationReason: string | null
  registrationType: 'candidate' | 'employer'
}

export default function EventCancellationEmail({
  name,
  eventName,
  eventSlug,
  startDate,
  endDate,
  cancellationReason,
  registrationType,
}: EventCancellationEmailProps) {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const isMultiDay = startDate !== endDate

  const dateDisplay = isMultiDay
    ? `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`
    : format(start, 'MMMM d, yyyy')

  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventSlug}`
  const calendarUrl = `${process.env.NEXT_PUBLIC_APP_URL}/calendar`

  return (
    <Html>
      <Head />
      <Preview>Event Cancellation: {eventName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>TalentCorp</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Text style={greeting}>Hi {name},</Text>

            <Text style={paragraph}>
              We regret to inform you that <strong>{eventName}</strong>,
              originally scheduled for <strong>{dateDisplay}</strong>, has been
              cancelled.
            </Text>

            {cancellationReason && (
              <Section style={reasonBox}>
                <Text style={reasonTitle}>Reason for Cancellation</Text>
                <Text style={reasonText}>{cancellationReason}</Text>
              </Section>
            )}

            <Text style={paragraph}>
              Your registration has been automatically cancelled and you will
              not be charged. We apologize for any inconvenience this may cause.
            </Text>

            <Text style={paragraph}>
              We invite you to browse other upcoming career fairs that might
              interest you.
            </Text>

            {/* CTA */}
            <Section style={buttonContainer}>
              <Button style={button} href={calendarUrl}>
                Browse Other Events
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Text style={footer}>
              If you have any questions, please contact us at{' '}
              <Link href="mailto:events@talentcorp.com.my" style={link}>
                events@talentcorp.com.my
              </Link>
            </Text>

            <Text style={footer}>
              This email was sent because you were registered for a TalentCorp
              career fair. Your data is processed in accordance with the
              Personal Data Protection Act 2010 (PDPA).
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 32px 20px',
  backgroundColor: '#dc2626',
}

const headerText = {
  margin: 0,
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
}

const content = {
  padding: '0 32px',
}

const greeting = {
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
  color: '#525252',
}

const reasonBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '16px',
  marginBottom: '24px',
}

const reasonTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  marginTop: 0,
  marginBottom: '8px',
  color: '#991b1b',
}

const reasonText = {
  fontSize: '14px',
  lineHeight: '20px',
  margin: 0,
  color: '#7f1d1d',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const hr = {
  borderColor: '#e5e5e5',
  margin: '32px 0',
}

const footer = {
  color: '#737373',
  fontSize: '12px',
  lineHeight: '18px',
  marginBottom: '8px',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}
