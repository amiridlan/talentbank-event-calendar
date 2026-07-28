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

interface RegistrationConfirmationEmailProps {
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

export default function RegistrationConfirmationEmail({
  name,
  eventName,
  eventSlug,
  startDate,
  endDate,
  venueName,
  venueAddress,
  region,
  registrationType,
  status,
  waitlistPosition,
  boothCount,
}: RegistrationConfirmationEmailProps) {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const isMultiDay = startDate !== endDate

  const dateDisplay = isMultiDay
    ? `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`
    : format(start, 'MMMM d, yyyy')

  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventSlug}`

  return (
    <Html>
      <Head />
      <Preview>
        {status === 'confirmed'
          ? `Your registration for ${eventName} is confirmed`
          : `You're on the waitlist for ${eventName}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>TalentCorp</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Text style={greeting}>Hi {name},</Text>

            {status === 'confirmed' ? (
              <>
                <Text style={paragraph}>
                  Great news! Your registration for <strong>{eventName}</strong>{' '}
                  is confirmed.
                </Text>

                {registrationType === 'employer' && boothCount && (
                  <Text style={paragraph}>
                    We've reserved <strong>{boothCount}</strong> booth
                    {boothCount > 1 ? 's' : ''} for your organization.
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  Thank you for your interest in <strong>{eventName}</strong>.
                </Text>

                <Text style={paragraph}>
                  The event is currently at full capacity. You've been added to
                  the waitlist at position <strong>{waitlistPosition}</strong>.
                  We'll notify you if a spot becomes available.
                </Text>
              </>
            )}

            {/* Event details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Event Details</Text>

              <Text style={detailItem}>
                <strong>Date:</strong> {dateDisplay}
              </Text>

              <Text style={detailItem}>
                <strong>Venue:</strong>{' '}
                {venueName || 'To be announced'}
                {venueAddress && (
                  <>
                    <br />
                    {venueAddress}
                  </>
                )}
              </Text>

              <Text style={detailItem}>
                <strong>Location:</strong> {region.replace('_', ' ')}
              </Text>

              <Text style={detailItem}>
                <strong>Registration Type:</strong>{' '}
                {registrationType === 'candidate' ? 'Candidate' : 'Employer'}
              </Text>
            </Section>

            {/* CTA */}
            {status === 'confirmed' && (
              <Section style={buttonContainer}>
                <Button style={button} href={eventUrl}>
                  View Event Details
                </Button>
              </Section>
            )}

            <Hr style={hr} />

            {/* PDPA notice */}
            <Text style={footer}>
              This email was sent because you registered for a TalentCorp
              career fair. Your data is processed in accordance with the
              Personal Data Protection Act 2010 (PDPA).
            </Text>

            <Text style={footer}>
              <Link href={eventUrl} style={link}>
                View event details
              </Link>{' '}
              |{' '}
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL}/calendar`}
                style={link}
              >
                Browse all events
              </Link>
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
  backgroundColor: '#2563eb',
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

const detailsBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
  marginBottom: '24px',
}

const detailsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: 0,
  marginBottom: '16px',
}

const detailItem = {
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '12px',
  color: '#525252',
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
