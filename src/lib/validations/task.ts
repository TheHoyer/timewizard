import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Tytuł jest wymagany')
    .max(255, 'Tytuł może mieć maksymalnie 255 znaków'),
  description: z.string().optional(),
  priority: z.number().min(1).max(5).default(1),
  estimatedMinutes: z
    .number()
    .min(1, 'Szacowany czas musi być większy niż 0')
    .max(480, 'Szacowany czas nie może przekraczać 8 godzin'),
  dueDate: z.string().datetime().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional().nullable(),
  recurringDays: z.array(z.number().min(0).max(6)).optional(),
  recurringEndDate: z.string().datetime().optional().nullable(),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
