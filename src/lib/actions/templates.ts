'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ==================== SCHEMAS ====================

const templateSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(100, 'Nazwa może mieć max 100 znaków'),
  title: z.string().min(1, 'Tytuł jest wymagany').max(200, 'Tytuł może mieć max 200 znaków'),
  description: z.string().max(2000).optional().nullable(),
  priority: z.coerce.number().int().min(1).max(5).default(1),
  estimatedMinutes: z.coerce.number().int().min(1).max(480).default(30),
  categoryId: z.string().optional().nullable(),
  subtasks: z.array(z.string().max(200)).optional(),
})

// ==================== TYPES ====================

export type TemplateFormState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
  data?: {
    id: string
    name: string
  }
}

// ==================== ACTIONS ====================

export async function getTemplates() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const templates = await prisma.taskTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true as const, data: templates }
  } catch (error) {
    console.error('Get templates error:', error)
    return { success: false as const, error: 'Nie udało się pobrać szablonów' }
  }
}

export async function getTemplate(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const template = await prisma.taskTemplate.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!template) {
      return { success: false as const, error: 'Szablon nie istnieje' }
    }

    return { success: true as const, data: template }
  } catch (error) {
    console.error('Get template error:', error)
    return { success: false as const, error: 'Nie udało się pobrać szablonu' }
  }
}

export async function createTemplate(
  _prevState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const rawData = {
    name: formData.get('name'),
    title: formData.get('title'),
    description: formData.get('description') || null,
    priority: formData.get('priority'),
    estimatedMinutes: formData.get('estimatedMinutes'),
    categoryId: formData.get('categoryId') || null,
    subtasks: formData.getAll('subtasks').filter(Boolean),
  }

  const validated = templateSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      error: 'Nieprawidłowe dane',
    }
  }

  const { name, title, description, priority, estimatedMinutes, categoryId, subtasks } = validated.data

  try {
    const template = await prisma.taskTemplate.create({
      data: {
        userId: session.user.id,
        name,
        title,
        description,
        priority,
        estimatedMinutes,
        categoryId,
        subtasks: subtasks?.length ? JSON.stringify(subtasks) : null,
      },
    })

    revalidatePath('/templates')
    return {
      success: true,
      data: { id: template.id, name: template.name },
    }
  } catch (error) {
    console.error('Create template error:', error)
    return { error: 'Nie udało się utworzyć szablonu' }
  }
}

export async function updateTemplate(
  _prevState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const id = formData.get('id') as string
  if (!id) {
    return { error: 'ID szablonu jest wymagane' }
  }

  const rawData = {
    name: formData.get('name'),
    title: formData.get('title'),
    description: formData.get('description') || null,
    priority: formData.get('priority'),
    estimatedMinutes: formData.get('estimatedMinutes'),
    categoryId: formData.get('categoryId') || null,
    subtasks: formData.getAll('subtasks').filter(Boolean),
  }

  const validated = templateSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      error: 'Nieprawidłowe dane',
    }
  }

  try {
    const existing = await prisma.taskTemplate.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return { error: 'Szablon nie istnieje' }
    }

    const { name, title, description, priority, estimatedMinutes, categoryId, subtasks } = validated.data

    const template = await prisma.taskTemplate.update({
      where: { id },
      data: {
        name,
        title,
        description,
        priority,
        estimatedMinutes,
        categoryId,
        subtasks: subtasks?.length ? JSON.stringify(subtasks) : null,
      },
    })

    revalidatePath('/templates')
    return {
      success: true,
      data: { id: template.id, name: template.name },
    }
  } catch (error) {
    console.error('Update template error:', error)
    return { error: 'Nie udało się zaktualizować szablonu' }
  }
}

export async function deleteTemplate(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const existing = await prisma.taskTemplate.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return { success: false as const, error: 'Szablon nie istnieje' }
    }

    await prisma.taskTemplate.delete({ where: { id } })

    revalidatePath('/templates')
    return { success: true as const }
  } catch (error) {
    console.error('Delete template error:', error)
    return { success: false as const, error: 'Nie udało się usunąć szablonu' }
  }
}

// Create task from template
export async function createTaskFromTemplate(templateId: string, dueDate?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const template = await prisma.taskTemplate.findFirst({
      where: { id: templateId, userId: session.user.id },
    })

    if (!template) {
      return { success: false as const, error: 'Szablon nie istnieje' }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title: template.title,
        description: template.description,
        priority: template.priority,
        estimatedMinutes: template.estimatedMinutes,
        categoryId: template.categoryId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    // Create subtasks if any
    if (template.subtasks) {
      const subtaskTitles = JSON.parse(template.subtasks) as string[]
      await prisma.subtask.createMany({
        data: subtaskTitles.map((title, index) => ({
          taskId: task.id,
          title,
          order: index,
        })),
      })
    }

    revalidatePath('/tasks')
    return { success: true as const, data: task }
  } catch (error) {
    console.error('Create task from template error:', error)
    return { success: false as const, error: 'Nie udało się utworzyć zadania z szablonu' }
  }
}
