'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'
import crypto from 'crypto'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/email'

// Schema dla żądania resetu hasła
const forgotPasswordSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
})

// Schema dla resetu hasła
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token jest wymagany'),
  password: z
    .string()
    .min(8, 'Hasło musi mieć minimum 8 znaków')
    .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
    .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła nie są identyczne',
  path: ['confirmPassword'],
})

// Żądanie resetu hasła
export async function requestPasswordReset(formData: FormData) {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Nieprawidłowe dane',
    }
  }

  const { email } = validatedFields.data

  try {
    // Sprawdź czy użytkownik istnieje
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Zawsze zwracaj sukces (nie ujawniaj czy email istnieje)
    if (!user) {
      return { success: true }
    }

    // Usuń stare tokeny
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // Wygeneruj nowy token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600 * 1000) // 1 godzina

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    // Wyślij email
    await sendPasswordResetEmail(email, token)

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      message: 'Wystąpił błąd. Spróbuj ponownie później.',
    }
  }
}

// Reset hasła z tokenem
export async function resetPassword(formData: FormData) {
  const validatedFields = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Nieprawidłowe dane',
    }
  }

  const { token, password } = validatedFields.data

  try {
    // Znajdź token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return {
        message: 'Nieprawidłowy lub wygasły link. Poproś o nowy.',
      }
    }

    // Sprawdź czy nie wygasł
    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return {
        message: 'Link wygasł. Poproś o nowy.',
      }
    }

    // Zaktualizuj hasło
    const hashedPassword = await hash(password, 12)
    
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    // Usuń użyty token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return {
      message: 'Wystąpił błąd. Spróbuj ponownie później.',
    }
  }
}

// Weryfikacja emaila
export async function verifyEmail(token: string) {
  try {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return {
        success: false,
        message: 'Nieprawidłowy link weryfikacyjny.',
      }
    }

    if (verificationToken.expires < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      })
      return {
        success: false,
        message: 'Link wygasł. Zaloguj się, aby otrzymać nowy.',
      }
    }

    // Zaktualizuj użytkownika
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    })

    // Usuń token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    })

    return { success: true }
  } catch (error) {
    console.error('Email verification error:', error)
    return {
      success: false,
      message: 'Wystąpił błąd. Spróbuj ponownie później.',
    }
  }
}

// Wyślij email weryfikacyjny
export async function sendEmailVerification(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, message: 'Użytkownik nie istnieje' }
    }

    if (user.emailVerified) {
      return { success: false, message: 'Email jest już zweryfikowany' }
    }

    // Usuń stare tokeny
    await prisma.emailVerificationToken.deleteMany({
      where: { email },
    })

    // Wygeneruj nowy token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 3600 * 1000) // 24 godziny

    await prisma.emailVerificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    await sendVerificationEmail(email, token)

    return { success: true }
  } catch (error) {
    console.error('Send verification error:', error)
    return {
      success: false,
      message: 'Wystąpił błąd. Spróbuj ponownie później.',
    }
  }
}
