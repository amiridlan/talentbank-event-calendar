import { Resend } from 'resend'

// Allow missing API key in development, but warn
const RESEND_API_KEY = process.env.RESEND_API_KEY

if (!RESEND_API_KEY) {
  console.warn(
    'RESEND_API_KEY is not set. Email sending will be disabled. Set this in your .env.local file to enable email notifications.'
  )
}

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export const FROM_EMAIL = 'TalentCorp Events <events@talentcorp.com.my>'

export const isEmailEnabled = () => Boolean(resend)
