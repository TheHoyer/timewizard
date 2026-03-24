'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'


const profileSchema = z.object({
  name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki').max(50),
  timezone: z.string().min(1, 'Wybierz strefę czasową'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Wprowadź aktualne hasło'),
  newPassword: z
    .string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
    .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
    .regex(/[^A-Za-z0-9]/, 'Hasło musi zawierać znak specjalny'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Hasła nie są identyczne',
  path: ['confirmPassword'],
})

const deleteAccountSchema = z.object({
  confirmation: z.string().refine((val) => val === 'USUŃ MOJE KONTO', {
    message: 'Wpisz "USUŃ MOJE KONTO" aby potwierdzić',
  }),
})

export type ProfileState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}


export async function updateProfileAction(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const data = {
    name: formData.get('name') as string,
    timezone: formData.get('timezone') as string,
  }

  const result = profileSchema.safeParse(data)

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: result.data.name,
        timezone: result.data.timezone,
      },
    })

    revalidatePath('/settings/profile')
    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { error: 'Nie udało się zaktualizować profilu' }
  }
}


export async function changePasswordAction(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const data = {
    currentPassword: formData.get('currentPassword') as string,
    newPassword: formData.get('newPassword') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const result = passwordSchema.safeParse(data)

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user?.password) {
      return { error: 'Konto nie ma ustawionego hasła (użyj OAuth)' }
    }

    const isValid = await bcrypt.compare(result.data.currentPassword, user.password)

    if (!isValid) {
      return {
        fieldErrors: { currentPassword: ['Nieprawidłowe hasło'] },
      }
    }

    const hashedPassword = await bcrypt.hash(result.data.newPassword, 12)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return { success: true }
  } catch (error) {
    console.error('Password change error:', error)
    return { error: 'Nie udało się zmienić hasła' }
  }
}


export async function deleteAccountAction(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const data = {
    confirmation: formData.get('confirmation') as string,
  }

  const result = deleteAccountSchema.safeParse(data)

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  try {
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        deletedAt: new Date(),
        email: `deleted_${session.user.id}@deleted.local`,
        name: 'Usunięte konto',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Delete account error:', error)
    return { error: 'Nie udało się usunąć konta' }
  }
}
