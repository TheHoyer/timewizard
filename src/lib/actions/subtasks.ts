'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ==================== SCHEMAS ====================

const subtaskSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').max(200, 'Tytuł może mieć max 200 znaków'),
  taskId: z.string().min(1, 'ID zadania jest wymagane'),
})

const updateSubtaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
})

// ==================== ACTIONS ====================

export async function getSubtasks(taskId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    // Verify task belongs to user
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id },
    })

    if (!task) {
      return { success: false as const, error: 'Zadanie nie istnieje' }
    }

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { order: 'asc' },
    })

    return { success: true as const, data: subtasks }
  } catch (error) {
    console.error('Get subtasks error:', error)
    return { success: false as const, error: 'Nie udało się pobrać podzadań' }
  }
}

export async function createSubtask(taskId: string, title: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  const validated = subtaskSchema.safeParse({ taskId, title })
  if (!validated.success) {
    return { success: false as const, error: 'Nieprawidłowe dane' }
  }

  try {
    // Verify task belongs to user
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id },
    })

    if (!task) {
      return { success: false as const, error: 'Zadanie nie istnieje' }
    }

    // Get max order
    const maxOrder = await prisma.subtask.aggregate({
      where: { taskId },
      _max: { order: true },
    })

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })

    revalidatePath('/tasks')
    return { success: true as const, data: subtask }
  } catch (error) {
    console.error('Create subtask error:', error)
    return { success: false as const, error: 'Nie udało się utworzyć podzadania' }
  }
}

export async function updateSubtask(
  id: string,
  data: { title?: string; completed?: boolean; order?: number }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    // Verify subtask belongs to user's task
    const subtask = await prisma.subtask.findUnique({
      where: { id },
      include: { task: true },
    })

    if (!subtask || subtask.task.userId !== session.user.id) {
      return { success: false as const, error: 'Podzadanie nie istnieje' }
    }

    const updated = await prisma.subtask.update({
      where: { id },
      data,
    })

    revalidatePath('/tasks')
    return { success: true as const, data: updated }
  } catch (error) {
    console.error('Update subtask error:', error)
    return { success: false as const, error: 'Nie udało się zaktualizować podzadania' }
  }
}

export async function deleteSubtask(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    // Verify subtask belongs to user's task
    const subtask = await prisma.subtask.findUnique({
      where: { id },
      include: { task: true },
    })

    if (!subtask || subtask.task.userId !== session.user.id) {
      return { success: false as const, error: 'Podzadanie nie istnieje' }
    }

    await prisma.subtask.delete({ where: { id } })

    revalidatePath('/tasks')
    return { success: true as const }
  } catch (error) {
    console.error('Delete subtask error:', error)
    return { success: false as const, error: 'Nie udało się usunąć podzadania' }
  }
}

export async function toggleSubtask(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const subtask = await prisma.subtask.findUnique({
      where: { id },
      include: { task: true },
    })

    if (!subtask || subtask.task.userId !== session.user.id) {
      return { success: false as const, error: 'Podzadanie nie istnieje' }
    }

    const updated = await prisma.subtask.update({
      where: { id },
      data: { completed: !subtask.completed },
    })

    revalidatePath('/tasks')
    return { success: true as const, data: updated }
  } catch (error) {
    console.error('Toggle subtask error:', error)
    return { success: false as const, error: 'Nie udało się zmienić statusu' }
  }
}

export async function reorderSubtasks(taskId: string, orderedIds: string[]) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    // Verify task belongs to user
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id },
    })

    if (!task) {
      return { success: false as const, error: 'Zadanie nie istnieje' }
    }

    // Update all orders in a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.subtask.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    revalidatePath('/tasks')
    return { success: true as const }
  } catch (error) {
    console.error('Reorder subtasks error:', error)
    return { success: false as const, error: 'Nie udało się zmienić kolejności' }
  }
}
