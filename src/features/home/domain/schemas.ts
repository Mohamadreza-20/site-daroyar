import { z } from 'zod'
import { email } from '@/shared/domain/fields'

export const newsletterSchema = z.object({ email })

export type NewsletterForm = z.output<typeof newsletterSchema>
