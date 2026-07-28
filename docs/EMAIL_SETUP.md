# Email Notification Setup

This project uses [Resend](https://resend.com) for transactional email delivery.

## Features

The system sends the following types of emails:

1. **Registration Confirmation** - Sent when a user registers for an event
   - Confirmed registration email
   - Waitlist confirmation email
2. **Event Cancellation** - Sent to all registered users when an event is cancelled
3. **Event Reminder** - Sent 7 days before an event to confirmed attendees

All emails are PDPA 2010 compliant and only sent to users who have provided consent.

## Setup Instructions

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### 2. Add and Verify Your Domain

1. In the Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `talentcorp.com.my`)
4. Add the provided DNS records to your domain:
   - **MX record** - For receiving bounces
   - **TXT records** - For SPF, DKIM authentication
5. Wait for verification (usually takes a few minutes)

**For Development/Testing:**
If you don't have a custom domain yet, Resend provides a test domain `onboarding.resend.dev` that you can use immediately. However, it can only send to your verified email address.

### 3. Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Talentbank Event Calendar Production")
4. Select **Full Access** permission
5. Copy the API key (starts with `re_`)

### 4. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
RESEND_API_KEY=re_your_api_key_here
```

### 5. Update Email Sender Address

If you're using a custom domain, update the sender email in `src/lib/email/client.ts`:

```typescript
export const FROM_EMAIL = 'TalentCorp Events <events@yourdomain.com>'
```

For development, you can use:

```typescript
export const FROM_EMAIL = 'onboarding@resend.dev'
```

## Email Templates

Email templates are located in `src/emails/` and built with React Email:

- `registration-confirmation.tsx` - Registration and waitlist confirmation
- `event-cancellation.tsx` - Event cancellation notice
- `event-reminder.tsx` - 7-day event reminder

### Previewing Email Templates

You can preview email templates locally by installing the React Email CLI:

```bash
npx react-email dev
```

This will start a development server at `http://localhost:3000` where you can view and test all email templates.

## Usage

### Sending Registration Confirmation

Registration confirmations are sent automatically when a user registers through the API:

```typescript
import { sendRegistrationConfirmation } from '@/lib/email/send'

await sendRegistrationConfirmation({
  to: 'user@example.com',
  name: 'John Doe',
  eventName: 'UiTM Career Fair 2025',
  eventSlug: 'uitm-career-fair-2025',
  startDate: '2025-02-15',
  endDate: '2025-02-15',
  venueName: 'UiTM Shah Alam',
  venueAddress: 'Shah Alam, Selangor',
  region: 'selangor',
  registrationType: 'candidate',
  status: 'confirmed',
})
```

### Sending Event Cancellation

```typescript
import { sendEventCancellation } from '@/lib/email/send'

await sendEventCancellation({
  to: 'user@example.com',
  name: 'John Doe',
  eventName: 'UiTM Career Fair 2025',
  eventSlug: 'uitm-career-fair-2025',
  startDate: '2025-02-15',
  endDate: '2025-02-15',
  cancellationReason: 'Postponed due to scheduling conflict',
  registrationType: 'candidate',
})
```

### Sending Event Reminder

Event reminders should be sent via a scheduled job/cron (not yet implemented):

```typescript
import { sendEventReminder } from '@/lib/email/send'

await sendEventReminder({
  to: 'user@example.com',
  name: 'John Doe',
  eventName: 'UiTM Career Fair 2025',
  eventSlug: 'uitm-career-fair-2025',
  startDate: '2025-02-15',
  endDate: '2025-02-15',
  venueName: 'UiTM Shah Alam',
  venueAddress: 'Shah Alam, Selangor',
  region: 'selangor',
  registrationType: 'candidate',
})
```

### Bulk Email Sending

For sending emails to multiple recipients (e.g., cancellation notices to all registered users):

```typescript
import { sendBulkEmails, sendEventCancellation } from '@/lib/email/send'

const recipients = [
  { email: 'user1@example.com', name: 'User 1', registrationType: 'candidate' },
  { email: 'user2@example.com', name: 'User 2', registrationType: 'employer' },
]

const result = await sendBulkEmails(recipients, (recipient) =>
  sendEventCancellation({
    to: recipient.email,
    name: recipient.name,
    eventName: event.name,
    eventSlug: event.slug,
    startDate: event.startDate,
    endDate: event.endDate,
    cancellationReason: event.cancellationReason,
    registrationType: recipient.registrationType,
  })
)

console.log(`Sent ${result.successful}/${result.total} emails`)
```

## Testing

Emails are disabled when `RESEND_API_KEY` is not set. In this case, the system will log what emails would have been sent without actually sending them.

This is useful for development and testing without consuming email quota.

## Rate Limits

Resend free tier limits:
- 100 emails/day
- 10 emails/second

The `sendBulkEmails` function handles rate limiting by sending emails in batches of 10 with 1-second delays between batches.

For production use, consider upgrading to a paid plan.

## PDPA Compliance

All emails include:
- Clear sender identification
- Unsubscribe information
- PDPA 2010 compliance notice
- Only sent to users who provided explicit consent during registration

Marketing emails are only sent to users who opted in via the `consentMarketing` checkbox during registration.

## Troubleshooting

### Emails Not Sending

1. Check that `RESEND_API_KEY` is set in `.env.local`
2. Verify your domain in the Resend dashboard
3. Check the server logs for error messages
4. Ensure the sender email domain matches your verified domain

### Emails Going to Spam

1. Verify your domain has correct SPF and DKIM records
2. Add a DMARC record to your domain
3. Ensure sender email matches verified domain
4. Avoid spammy language in subject lines and content

### Testing Emails

For local testing without sending real emails:
1. Remove or comment out `RESEND_API_KEY` from `.env.local`
2. Check server logs to see what emails would have been sent
3. Use `npx react-email dev` to preview email templates

## Future Enhancements

- [ ] Implement scheduled reminder emails (cron job)
- [ ] Add email templates for event updates/changes
- [ ] Implement email analytics tracking
- [ ] Add support for email attachments (e.g., .ics files)
- [ ] Implement email preferences management
