'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

// ==================== SCHEMAS ====================

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Imię musi mieć co najmniej 2 znaki')
    .max(100, 'Imię może mieć maksymalnie 100 znaków'),
  email: z
    .string()
    .min(1, 'Email jest wymagany')
    .email('Nieprawidłowy format email - wprowadź poprawny adres')
    .max(150, 'Email może mieć maksymalnie 150 znaków'),
  password: z
    .string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .regex(/[a-z]/, 'Hasło musi zawierać co najmniej jedną małą literę')
    .regex(/[A-Z]/, 'Hasło musi zawierać co najmniej jedną wielką literę')
    .regex(/\d/, 'Hasło musi zawierać co najmniej jedną cyfrę'),
  confirmPassword: z
    .string()
    .min(1, 'Potwierdzenie hasła jest wymagane'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła nie są identyczne',
  path: ['confirmPassword'],
})

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
})

// ==================== TYPES ====================

export type AuthState = {
  error?: string
  success?: boolean
  fieldErrors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
}

// ==================== ACTIONS ====================

export async function registerAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  // Parse and validate form data
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const validation = registerSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      error: 'Proszę poprawić poniższe błędy',
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validation.data

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        error: 'Użytkownik z tym adresem email już istnieje',
        fieldErrors: { email: ['Ten email jest już zajęty'] },
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        timezone: 'Europe/Warsaw',
        plan: 'FREE',
      },
    })

    // Auto-login after registration
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

  } catch (error) {
    console.error('Registration error:', error)
    return {
      error: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.',
    }
  }

  // Redirect to dashboard after successful registration and login
  redirect('/dashboard')
}

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validation = loginSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      error: 'Błąd walidacji',
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  try {
    await signIn('credentials', {
      email: rawData.email,
      password: rawData.password,
      redirect: false,
    })

    // Update last active timestamp
    await prisma.user.update({
      where: { email: rawData.email },
      data: { lastActiveAt: new Date() },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Nieprawidłowy email lub hasło' }
        default:
          return { error: 'Wystąpił błąd podczas logowania' }
      }
    }
    throw error
  }

  redirect('/dashboard')
}
