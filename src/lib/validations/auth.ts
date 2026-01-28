import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email jest wymagany')
    .email('Nieprawidłowy format email'),
  password: z
    .string()
    .min(1, 'Hasło jest wymagane')
    .min(8, 'Hasło musi mieć co najmniej 8 znaków'),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Imię jest wymagane')
      .min(2, 'Imię musi mieć co najmniej 2 znaki'),
    email: z
      .string()
      .min(1, 'Email jest wymagany')
      .email('Nieprawidłowy format email'),
    password: z
      .string()
      .min(1, 'Hasło jest wymagane')
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Hasło musi zawierać małą literę, wielką literę i cyfrę'
      ),
    confirmPassword: z.string().min(1, 'Potwierdzenie hasła jest wymagane'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła muszą być identyczne',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
