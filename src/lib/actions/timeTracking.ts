'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { unlockAchievement } from './pomodoro'

// ==================== SCHEMAS ====================

const startTimeEntrySchema = z.object({
  taskId: z.string().min(1, 'Task ID jest wymagane'),
  note: z.string().optional().nullable(),
})

const updateTimeEntrySchema = z.object({
  id: z.string().min(1),
  note: z.string().optional().nullable(),
})

// ==================== TYPES ====================

export type TimeEntry = {
  id: string
  taskId: string
  startedAt: Date
  endedAt: Date | null
  duration: number | null
  note: string | null
  task: {
    id: string
    title: string
  }
}

export type TimeStats = {
  todaySeconds: number
  weekSeconds: number
  monthSeconds: number
  totalSeconds: number
}

export type TaskTimeReport = {
  taskId: string
  taskTitle: string
  totalSeconds: number
  entriesCount: number
}

// ==================== ACTIONS ====================

/**
 * Start time tracking for a task
 */
export async function startTimeEntry(data: z.infer<typeof startTimeEntrySchema>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Musisz być zalogowany' }
  }

  const parsed = startTimeEntrySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Nieprawidłowe dane' }
  }

  try {
    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id: parsed.data.taskId,
        userId: session.user.id,
      },
    })

    if (!task) {
      return { success: false, error: 'Zadanie nie znalezione' }
    }

    // Stop any active time entries
    await stopAllActiveEntries(session.user.id)

    // Start new time entry
    const entry = await prisma.timeEntry.create({
      data: {
        userId: session.user.id,
        taskId: parsed.data.taskId,
        note: parsed.data.note || null,
        startedAt: new Date(),
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
    })

    // Update task status to in progress
    await prisma.task.update({
      where: { id: parsed.data.taskId },
      data: { status: 'IN_PROGRESS' },
    })

    revalidatePath('/dashboard')
    return { success: true, data: entry }
  } catch (error) {
    console.error('Error starting time entry:', error)
    return { success: false, error: 'Wystąpił błąd podczas rozpoczynania śledzenia' }
  }
}

/**
 * Stop time tracking
 */
export async function stopTimeEntry(entryId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Musisz być zalogowany' }
  }

  try {
    const entry = await prisma.timeEntry.findFirst({
      where: {
        id: entryId,
        userId: session.user.id,
        endedAt: null,
      },
    })

    if (!entry) {
      return { success: false, error: 'Aktywny wpis nie znaleziony' }
    }

    const endedAt = new Date()
    const duration = Math.floor((endedAt.getTime() - entry.startedAt.getTime()) / 1000)

    const updated = await prisma.timeEntry.update({
      where: { id: entryId },
      data: {
        endedAt,
        duration,
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
    })

    // Award XP: 1 XP per minute tracked
    const xpGained = Math.floor(duration / 60)
    if (xpGained > 0) {
      await addXpForTimeTracking(session.user.id, xpGained)
    }

    // Check time tracking achievements
    await checkTimeAchievements(session.user.id)

    revalidatePath('/dashboard')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Error stopping time entry:', error)
    return { success: false, error: 'Wystąpił błąd podczas zatrzymywania śledzenia' }
  }
}

/**
 * Get active time entry
 */
export async function getActiveTimeEntry(): Promise<TimeEntry | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  try {
    const entry = await prisma.timeEntry.findFirst({
      where: {
        userId: session.user.id,
        endedAt: null,
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    })

    return entry
  } catch (error) {
    console.error('Error getting active time entry:', error)
    return null
  }
}

/**
 * Get time entries for a task
 */
export async function getTaskTimeEntries(taskId: string): Promise<TimeEntry[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: session.user.id,
        taskId,
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    })

    return entries
  } catch (error) {
    console.error('Error getting task time entries:', error)
    return []
  }
}

/**
 * Get time statistics
 */
export async function getTimeStats(): Promise<TimeStats> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      todaySeconds: 0,
      weekSeconds: 0,
      monthSeconds: 0,
      totalSeconds: 0,
    }
  }

  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [todayEntries, weekEntries, monthEntries, totalEntries] = await Promise.all([
      prisma.timeEntry.findMany({
        where: {
          userId: session.user.id,
          duration: { not: null },
          startedAt: { gte: startOfDay },
        },
        select: { duration: true },
      }),
      prisma.timeEntry.findMany({
        where: {
          userId: session.user.id,
          duration: { not: null },
          startedAt: { gte: startOfWeek },
        },
        select: { duration: true },
      }),
      prisma.timeEntry.findMany({
        where: {
          userId: session.user.id,
          duration: { not: null },
          startedAt: { gte: startOfMonth },
        },
        select: { duration: true },
      }),
      prisma.timeEntry.findMany({
        where: {
          userId: session.user.id,
          duration: { not: null },
        },
        select: { duration: true },
      }),
    ])

    return {
      todaySeconds: todayEntries.reduce((sum, e) => sum + (e.duration || 0), 0),
      weekSeconds: weekEntries.reduce((sum, e) => sum + (e.duration || 0), 0),
      monthSeconds: monthEntries.reduce((sum, e) => sum + (e.duration || 0), 0),
      totalSeconds: totalEntries.reduce((sum, e) => sum + (e.duration || 0), 0),
    }
  } catch (error) {
    console.error('Error getting time stats:', error)
    return {
      todaySeconds: 0,
      weekSeconds: 0,
      monthSeconds: 0,
      totalSeconds: 0,
    }
  }
}

/**
 * Get time report by task
 */
export async function getTimeReportByTask(days = 7): Promise<TaskTimeReport[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: session.user.id,
        duration: { not: null },
        startedAt: { gte: startDate },
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
    })

    // Group by task
    const taskMap = new Map<string, TaskTimeReport>()
    
    for (const entry of entries) {
      const existing = taskMap.get(entry.taskId)
      if (existing) {
        existing.totalSeconds += entry.duration || 0
        existing.entriesCount++
      } else {
        taskMap.set(entry.taskId, {
          taskId: entry.taskId,
          taskTitle: entry.task.title,
          totalSeconds: entry.duration || 0,
          entriesCount: 1,
        })
      }
    }

    return Array.from(taskMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds)
  } catch (error) {
    console.error('Error getting time report:', error)
    return []
  }
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(entryId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Musisz być zalogowany' }
  }

  try {
    await prisma.timeEntry.delete({
      where: {
        id: entryId,
        userId: session.user.id,
      },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error deleting time entry:', error)
    return { success: false, error: 'Wystąpił błąd podczas usuwania wpisu' }
  }
}

// ==================== HELPER FUNCTIONS ====================

async function stopAllActiveEntries(userId: string) {
  const activeEntries = await prisma.timeEntry.findMany({
    where: {
      userId,
      endedAt: null,
    },
  })

  for (const entry of activeEntries) {
    const endedAt = new Date()
    const duration = Math.floor((endedAt.getTime() - entry.startedAt.getTime()) / 1000)
    
    await prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        endedAt,
        duration,
      },
    })
  }
}

async function addXpForTimeTracking(userId: string, xp: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  })

  if (!user) return

  const newXp = user.xp + xp
  const xpForNextLevel = (level: number) => level * 100 + Math.floor(level / 5) * 50
  
  let newLevel = user.level
  let remainingXp = newXp
  
  while (remainingXp >= xpForNextLevel(newLevel)) {
    remainingXp -= xpForNextLevel(newLevel)
    newLevel++
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
    },
  })
}

async function checkTimeAchievements(userId: string) {
  const totalSeconds = await prisma.timeEntry.aggregate({
    where: {
      userId,
      duration: { not: null },
    },
    _sum: { duration: true },
  })

  const totalHours = (totalSeconds._sum.duration || 0) / 3600

  const achievementCodes: string[] = []
  if (totalHours >= 1) achievementCodes.push('time_1h')
  if (totalHours >= 10) achievementCodes.push('time_10h')
  if (totalHours >= 100) achievementCodes.push('time_100h')

  for (const code of achievementCodes) {
    await unlockAchievement(userId, code)
  }
}
