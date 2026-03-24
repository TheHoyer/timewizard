'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'
import crypto from 'crypto'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/email'


const forgotPasswordSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
})


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
    
    const user = await prisma.user.findUnique({
      where: { email },
    })

    
    if (!user) {
      return { success: true }
    }

    
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600 * 1000) 

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    
    await sendPasswordResetEmail(email, token)

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      message: 'Wystąpił błąd. Spróbuj ponownie później.',
    }
  }
}


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
    
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return {
        message: 'Nieprawidłowy lub wygasły link. Poproś o nowy.',
      }
    }

    
    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return {
        message: 'Link wygasł. Poproś o nowy.',
      }
    }

    
    const hashedPassword = await hash(password, 12)
    
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    
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

    
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    })

    
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

    
    await prisma.emailVerificationToken.deleteMany({
      where: { email },
    })

    
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 3600 * 1000) 

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
