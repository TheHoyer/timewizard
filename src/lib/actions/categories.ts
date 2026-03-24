'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'



const categorySchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(50, 'Nazwa może mieć max 50 znaków'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Nieprawidłowy format koloru'),
  icon: z.string().optional().nullable(),
})

const updateCategorySchema = categorySchema.extend({
  id: z.string().min(1, 'ID kategorii jest wymagane'),
})



export type CategoryFormState = {
  success?: boolean
  error?: string
  fieldErrors?: {
    name?: string[]
    color?: string[]
    icon?: string[]
  }
  data?: {
    id: string
    name: string
    color: string
    icon: string | null
  }
}



export async function getCategories() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    })

    return { success: true as const, data: categories }
  } catch (error) {
    console.error('Get categories error:', error)
    return { success: false as const, error: 'Nie udało się pobrać kategorii' }
  }
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const validatedFields = categorySchema.safeParse({
    name: formData.get('name'),
    color: formData.get('color'),
    icon: formData.get('icon') || null,
  })

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Nieprawidłowe dane',
    }
  }

  const { name, color, icon } = validatedFields.data

  try {
    
    const existingCategories = await prisma.category.findMany({
      where: { userId: session.user.id },
      select: { name: true },
    })
    const existing = existingCategories.some(
      (cat: { name: string }) => cat.name.toLowerCase() === name.toLowerCase()
    )

    if (existing) {
      return {
        fieldErrors: { name: ['Kategoria o tej nazwie już istnieje'] },
        error: 'Kategoria o tej nazwie już istnieje',
      }
    }

    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name,
        color,
        icon,
      },
    })

    revalidatePath('/tasks')
    revalidatePath('/settings/categories')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: category,
    }
  } catch (error) {
    console.error('Create category error:', error)
    return { error: 'Nie udało się utworzyć kategorii' }
  }
}

export async function updateCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const validatedFields = updateCategorySchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    color: formData.get('color'),
    icon: formData.get('icon') || null,
  })

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Nieprawidłowe dane',
    }
  }

  const { id, name, color, icon } = validatedFields.data

  try {
    
    const existing = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return { error: 'Kategoria nie istnieje' }
    }

    
    const allCategories = await prisma.category.findMany({
      where: { userId: session.user.id, id: { not: id } },
      select: { name: true },
    })
    const duplicate = allCategories.some(
      (cat: { name: string }) => cat.name.toLowerCase() === name.toLowerCase()
    )

    if (duplicate) {
      return {
        fieldErrors: { name: ['Kategoria o tej nazwie już istnieje'] },
        error: 'Kategoria o tej nazwie już istnieje',
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, color, icon },
    })

    revalidatePath('/tasks')
    revalidatePath('/settings/categories')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: category,
    }
  } catch (error) {
    console.error('Update category error:', error)
    return { error: 'Nie udało się zaktualizować kategorii' }
  }
}

export async function deleteCategory(categoryId: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  try {
    
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: session.user.id },
    })

    if (!category) {
      return { error: 'Kategoria nie istnieje' }
    }

    
    await prisma.category.delete({
      where: { id: categoryId },
    })

    revalidatePath('/tasks')
    revalidatePath('/settings/categories')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Delete category error:', error)
    return { error: 'Nie udało się usunąć kategorii' }
  }
}
