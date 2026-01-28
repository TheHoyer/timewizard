import { z } from 'zod'

export const availabilityBlockSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Nieprawidłowy format czasu (np. 09:00)'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Nieprawidłowy format czasu (np. 17:00)'),
  blockType: z.enum(['WORK', 'PERSONAL', 'FOCUS']).default('WORK'),
})

export const updateAvailabilitySchema = z.object({
  blocks: z.array(availabilityBlockSchema),
})

export type AvailabilityBlockInput = z.infer<typeof availabilityBlockSchema>
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>
