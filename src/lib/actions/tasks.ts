'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { prioritizeTask } from '@/lib/ai/prioritizeTask'

// ==================== SCHEMAS ====================

const taskSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').max(200, 'Tytuł może mieć max 200 znaków'),
  description: z.string().max(2000, 'Opis może mieć max 2000 znaków').optional().nullable(),
  priority: z.coerce.number().int().min(1).max(5).default(1),
  estimatedMinutes: z.coerce.number().int().min(1, 'Czas musi być większy od 0').max(480, 'Maksymalnie 8 godzin'),
  dueDate: z.string().optional().nullable().transform((val) => {
    if (!val) return null
    const date = new Date(val)
    return isNaN(date.getTime()) ? null : date
  }),
  categoryId: z.string().optional().nullable(),
  isRecurring: z.coerce.boolean().default(false),
  recurringType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional().nullable(),
  recurringDays: z.string().optional().nullable(), // JSON string
  recurringEndDate: z.string().optional().nullable().transform((val) => {
    if (!val) return null
    const date = new Date(val)
    return isNaN(date.getTime()) ? null : date
  }),
})

const updateTaskSchema = taskSchema.extend({
  id: z.string().min(1, 'ID zadania jest wymagane'),
})

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
})

// ==================== TYPES ====================

export type TaskFormState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
  data?: {
    id: string
    title: string
  }
}

export type TaskFilters = {
  status?: string | null
  categoryId?: string | null
  priority?: number | null
  search?: string | null
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

// ==================== ACTIONS ====================

export async function getTasks(filters: TaskFilters = {}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const where: Record<string, unknown> = {
      userId: session.user.id,
      deletedAt: null,
    }

    // Apply filters
    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId
    }

    if (filters.priority) {
      where.priority = filters.priority
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // Determine ordering
    const orderBy: Record<string, string>[] = []
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'

    if (sortBy === 'dueDate') {
      orderBy.push({ dueDate: sortOrder })
      orderBy.push({ priority: 'desc' })
    } else if (sortBy === 'priority') {
      orderBy.push({ priority: sortOrder })
      orderBy.push({ dueDate: 'asc' })
    } else if (sortBy === 'title') {
      orderBy.push({ title: sortOrder })
    } else {
      orderBy.push({ createdAt: sortOrder })
    }

    const tasks = await prisma.task.findMany({
      where,
      include: { category: true },
      orderBy,
    })

    return { success: true as const, data: tasks }
  } catch (error) {
    console.error('Get tasks error:', error)
    return { success: false as const, error: 'Nie udało się pobrać zadań' }
  }
}

export async function getTask(taskId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
        deletedAt: null,
      },
      include: { category: true },
    })

    if (!task) {
      return { error: 'Zadanie nie istnieje' }
    }

    return { data: task }
  } catch (error) {
    console.error('Get task error:', error)
    return { error: 'Nie udało się pobrać zadania' }
  }
}

export async function createTask(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const validatedFields = taskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || null,
    priority: formData.get('priority') || 1,
    estimatedMinutes: formData.get('estimatedMinutes') || 30,
    dueDate: formData.get('dueDate') || null,
    categoryId: formData.get('categoryId') || null,
    isRecurring: formData.get('isRecurring') === 'true',
    recurringType: formData.get('recurringType') || null,
    recurringDays: formData.get('recurringDays') || null,
    recurringEndDate: formData.get('recurringEndDate') || null,
  })

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Nieprawidłowe dane',
    }
  }

  const data = validatedFields.data

  try {
    let categoryName: string | null = null

    // Verify category ownership if provided
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId: session.user.id },
        select: { name: true },
      })
      if (!category) {
        return { error: 'Kategoria nie istnieje' }
      }
      categoryName = category.name
    }

    const aiPriority = await prioritizeTask({
      title: data.title,
      description: data.description,
      estimatedMinutes: data.estimatedMinutes,
      dueDate: data.dueDate,
      isRecurring: data.isRecurring,
      recurringType: data.recurringType,
      categoryName,
      suggestedPriority: data.priority,
    })

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        priority: aiPriority.priority,
        estimatedMinutes: data.estimatedMinutes,
        dueDate: data.dueDate,
        categoryId: data.categoryId,
        isRecurring: data.isRecurring,
        recurringType: data.recurringType,
        recurringDays: data.recurringDays ? JSON.parse(data.recurringDays) : undefined,
        recurringEndDate: data.recurringEndDate,
      },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { id: task.id, title: task.title },
    }
  } catch (error) {
    console.error('Create task error:', error)
    return { error: 'Nie udało się utworzyć zadania' }
  }
}

export async function updateTask(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const validatedFields = updateTaskSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    description: formData.get('description') || null,
    priority: formData.get('priority') || 1,
    estimatedMinutes: formData.get('estimatedMinutes') || 30,
    dueDate: formData.get('dueDate') || null,
    categoryId: formData.get('categoryId') || null,
    isRecurring: formData.get('isRecurring') === 'true',
    recurringType: formData.get('recurringType') || null,
    recurringDays: formData.get('recurringDays') || null,
    recurringEndDate: formData.get('recurringEndDate') || null,
  })

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Nieprawidłowe dane',
    }
  }

  const { id, ...data } = validatedFields.data

  try {
    let categoryName: string | null = null

    // Verify ownership
    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return { error: 'Zadanie nie istnieje' }
    }

    // Verify category ownership if provided
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId: session.user.id },
        select: { name: true },
      })
      if (!category) {
        return { error: 'Kategoria nie istnieje' }
      }
      categoryName = category.name
    }

    const aiPriority = await prioritizeTask({
      title: data.title,
      description: data.description,
      estimatedMinutes: data.estimatedMinutes,
      dueDate: data.dueDate,
      isRecurring: data.isRecurring,
      recurringType: data.recurringType,
      categoryName,
      suggestedPriority: data.priority,
    })

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: aiPriority.priority,
        estimatedMinutes: data.estimatedMinutes,
        dueDate: data.dueDate,
        categoryId: data.categoryId,
        isRecurring: data.isRecurring,
        recurringType: data.recurringType,
        recurringDays: data.recurringDays ? JSON.parse(data.recurringDays) : undefined,
        recurringEndDate: data.recurringEndDate,
      },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { id: task.id, title: task.title },
    }
  } catch (error) {
    console.error('Update task error:', error)
    return { error: 'Nie udało się zaktualizować zadania' }
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  const validated = updateStatusSchema.safeParse({ id: taskId, status })
  if (!validated.success) {
    return { error: 'Nieprawidłowe dane' }
  }

  try {
    // Verify ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id, deletedAt: null },
    })

    if (!task) {
      return { error: 'Zadanie nie istnieje' }
    }

    const isCompleting = status === 'COMPLETED' && task.status !== 'COMPLETED'
    const isUncompleting = status !== 'COMPLETED' && task.status === 'COMPLETED'

    // Update task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    })

    // Update user stats
    if (isCompleting) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalTasksCompleted: { increment: 1 },
          lastActiveAt: new Date(),
        },
      })
      
      // Award XP and check achievements for completing task
      const xpGained = 10 + (task.priority * 5) // 10 base + 5 per priority level
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: { increment: xpGained },
        },
      })
      
      // Check achievements asynchronously
      const { checkTaskAchievements, updateUserStreak } = await import('./gamification')
      await checkTaskAchievements(session.user.id)
      await updateUserStreak()
    } else if (isUncompleting) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalTasksCompleted: { decrement: 1 },
        },
      })
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Update task status error:', error)
    return { error: 'Nie udało się zaktualizować statusu' }
  }
}

export async function deleteTask(taskId: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  try {
    // Verify ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id, deletedAt: null },
    })

    if (!task) {
      return { error: 'Zadanie nie istnieje' }
    }

    // Soft delete
    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Delete task error:', error)
    return { error: 'Nie udało się usunąć zadania' }
  }
}

export async function restoreTask(taskId: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  try {
    // Verify ownership (including deleted)
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id, deletedAt: { not: null } },
    })

    if (!task) {
      return { error: 'Zadanie nie istnieje lub nie jest usunięte' }
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: null },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Restore task error:', error)
    return { error: 'Nie udało się przywrócić zadania' }
  }
}

export async function permanentlyDeleteTask(taskId: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Musisz być zalogowany' }
  }

  try {
    // Verify ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id },
    })

    if (!task) {
      return { error: 'Zadanie nie istnieje' }
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Permanently delete task error:', error)
    return { error: 'Nie udało się usunąć zadania' }
  }
}

// ==================== BATCH OPERATIONS ====================

export async function batchUpdateStatus(taskIds: string[], status: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  if (!taskIds.length) {
    return { success: false as const, error: 'Wybierz co najmniej jedno zadanie' }
  }

  try {
    // Verify all tasks belong to user
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds }, userId: session.user.id },
    })

    if (tasks.length !== taskIds.length) {
      return { success: false as const, error: 'Niektóre zadania nie istnieją' }
    }

    const updateData: Record<string, unknown> = { status }
    
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    await prisma.task.updateMany({
      where: { id: { in: taskIds }, userId: session.user.id },
      data: updateData,
    })

    // Update user stats if completing tasks
    if (status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalTasksCompleted: { increment: taskIds.length },
          lastActiveAt: new Date(),
        },
      })
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return { success: true as const, count: taskIds.length }
  } catch (error) {
    console.error('Batch update status error:', error)
    return { success: false as const, error: 'Nie udało się zaktualizować zadań' }
  }
}

export async function batchUpdateCategory(taskIds: string[], categoryId: string | null) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  if (!taskIds.length) {
    return { success: false as const, error: 'Wybierz co najmniej jedno zadanie' }
  }

  try {
    // Verify category belongs to user (if provided)
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: session.user.id },
      })
      if (!category) {
        return { success: false as const, error: 'Kategoria nie istnieje' }
      }
    }

    await prisma.task.updateMany({
      where: { id: { in: taskIds }, userId: session.user.id },
      data: { categoryId },
    })

    revalidatePath('/tasks')
    return { success: true as const, count: taskIds.length }
  } catch (error) {
    console.error('Batch update category error:', error)
    return { success: false as const, error: 'Nie udało się zaktualizować kategorii' }
  }
}

export async function batchUpdatePriority(taskIds: string[], priority: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  if (!taskIds.length) {
    return { success: false as const, error: 'Wybierz co najmniej jedno zadanie' }
  }

  if (priority < 1 || priority > 5) {
    return { success: false as const, error: 'Nieprawidłowy priorytet' }
  }

  try {
    await prisma.task.updateMany({
      where: { id: { in: taskIds }, userId: session.user.id },
      data: { priority },
    })

    revalidatePath('/tasks')
    return { success: true as const, count: taskIds.length }
  } catch (error) {
    console.error('Batch update priority error:', error)
    return { success: false as const, error: 'Nie udało się zaktualizować priorytetu' }
  }
}

export async function batchDelete(taskIds: string[]) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  if (!taskIds.length) {
    return { success: false as const, error: 'Wybierz co najmniej jedno zadanie' }
  }

  try {
    await prisma.task.updateMany({
      where: { id: { in: taskIds }, userId: session.user.id },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return { success: true as const, count: taskIds.length }
  } catch (error) {
    console.error('Batch delete error:', error)
    return { success: false as const, error: 'Nie udało się usunąć zadań' }
  }
}

// ==================== EXPORT ====================

export async function exportTasks(format: 'json' | 'csv' = 'json') {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id, deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    type TaskWithCategory = typeof tasks[number]

    if (format === 'csv') {
      const headers = [
        'ID', 'Tytuł', 'Opis', 'Status', 'Priorytet', 'Kategoria',
        'Szacowany czas (min)', 'Termin', 'Ukończono', 'Utworzono'
      ]
      
      const rows = tasks.map((task: TaskWithCategory) => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.status,
        task.priority,
        task.category?.name || '',
        task.estimatedMinutes,
        task.dueDate?.toISOString() || '',
        task.completedAt?.toISOString() || '',
        task.createdAt.toISOString(),
      ])

      const csv = [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n')
      return { success: true as const, data: csv, format: 'csv' as const }
    }

    // JSON format
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalTasks: tasks.length,
      tasks: tasks.map((task: TaskWithCategory) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        category: task.category?.name || null,
        estimatedMinutes: task.estimatedMinutes,
        dueDate: task.dueDate?.toISOString() || null,
        completedAt: task.completedAt?.toISOString() || null,
        createdAt: task.createdAt.toISOString(),
      })),
    }

    return { success: true as const, data: JSON.stringify(exportData, null, 2), format: 'json' as const }
  } catch (error) {
    console.error('Export tasks error:', error)
    return { success: false as const, error: 'Nie udało się wyeksportować zadań' }
  }
}

// ==================== STATISTICS ====================

export async function getTaskStats(period: 'week' | 'month' | 'year' = 'week') {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    // Get all tasks in period
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        status: true,
        priority: true,
        estimatedMinutes: true,
        completedAt: true,
        createdAt: true,
        categoryId: true,
        category: { select: { id: true, name: true, color: true } },
      },
    })

    type TaskItem = typeof tasks[number]

    const completedTasks = tasks.filter((t: TaskItem) => t.status === 'COMPLETED')
    const totalEstimatedTime = tasks.reduce((sum: number, t: TaskItem) => sum + t.estimatedMinutes, 0)
    const completedTime = completedTasks.reduce((sum: number, t: TaskItem) => sum + t.estimatedMinutes, 0)

    // Group by day for chart
    const dailyStats: Record<string, { created: number; completed: number }> = {}
    
    tasks.forEach((task: TaskItem) => {
      const day = task.createdAt.toISOString().split('T')[0]
      if (!dailyStats[day]) {
        dailyStats[day] = { created: 0, completed: 0 }
      }
      dailyStats[day].created++
    })

    completedTasks.forEach((task: TaskItem) => {
      if (task.completedAt) {
        const day = task.completedAt.toISOString().split('T')[0]
        if (!dailyStats[day]) {
          dailyStats[day] = { created: 0, completed: 0 }
        }
        dailyStats[day].completed++
      }
    })

    // Category breakdown
    const categoryStats: Record<string, { id: string; count: number; completed: number; color: string }> = {}
    tasks.forEach((task: TaskItem) => {
      const catId = task.category?.id || 'uncategorized'
      const catName = task.category?.name || 'Bez kategorii'
      const catColor = task.category?.color || '#94a3b8'
      if (!categoryStats[catName]) {
        categoryStats[catName] = { id: catId, count: 0, completed: 0, color: catColor }
      }
      categoryStats[catName].count++
      if (task.status === 'COMPLETED') {
        categoryStats[catName].completed++
      }
    })

    // Priority breakdown
    const priorityStats = [1, 2, 3, 4, 5].map(p => ({
      priority: p,
      total: tasks.filter((t: TaskItem) => t.priority === p).length,
      completed: completedTasks.filter((t: TaskItem) => t.priority === p).length,
    }))

    return {
      success: true as const,
      data: {
        period,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
        totalEstimatedTime,
        completedTime,
        dailyStats: Object.entries(dailyStats)
          .map(([date, stats]) => ({ date, ...stats }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        categoryStats: Object.entries(categoryStats)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.count - a.count),
        priorityStats,
        // Dane dla wykresów Recharts
        tasks: tasks.map((t: TaskItem) => ({
          id: t.id,
          status: t.status,
          completedAt: t.completedAt,
          createdAt: t.createdAt,
          priority: t.priority,
          estimatedMinutes: t.estimatedMinutes,
          categoryId: t.categoryId,
        })),
      },
    }
  } catch (error) {
    console.error('Get task stats error:', error)
    return { success: false as const, error: 'Nie udało się pobrać statystyk' }
  }
}
