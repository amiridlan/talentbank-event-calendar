import { z } from 'zod'

export const registrationSchema = z.object({
  eventId: z.string().uuid(),
  registrationType: z.enum(['candidate', 'employer']),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  boothCount: z.number().int().positive().optional(),
  consentDataProcessing: z.boolean().refine((val) => val === true, {
    message: 'You must consent to data processing to register',
  }),
  consentMarketing: z.boolean().optional().default(false),
})

export type RegistrationInput = z.infer<typeof registrationSchema>

export const registrationResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  registrationType: z.enum(['candidate', 'employer']),
  email: z.string(),
  name: z.string(),
  status: z.enum(['pending', 'confirmed', 'waitlisted', 'cancelled']),
  waitlistPosition: z.number().nullable(),
  registeredAt: z.string().datetime(),
})

export type RegistrationResponse = z.infer<typeof registrationResponseSchema>
