import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nazwa jest wymagana')
    .max(50, 'Nazwa może mieć maksymalnie 50 znaków'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Nieprawidłowy format koloru (np. #4F46E5)')
    .default('#4F46E5'),
  icon: z.string().optional(),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
