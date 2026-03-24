'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'



const startPomodoroSchema = z.object({
  taskId: z.string().optional().nullable(),
  duration: z.number().int().min(1).max(120).default(25),
  type: z.enum(['WORK', 'SHORT_BREAK', 'LONG_BREAK']).default('WORK'),
})



export type PomodoroSession = {
  id: string
  taskId: string | null
  duration: number
  type: string
  startedAt: Date
  endedAt: Date | null
  completed: boolean
  task?: {
    id: string
    title: string
  } | null
}

export type PomodoroStats = {
  todaySessions: number
  todayMinutes: number
  weekSessions: number
  weekMinutes: number
  totalSessions: number
  totalMinutes: number
}



export async function startPomodoro(data: z.infer<typeof startPomodoroSchema>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Musisz być zalogowany' }
  }

  const parsed = startPomodoroSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Nieprawidłowe dane' }
  }

  try {
    
    await prisma.pomodoroSession.updateMany({
      where: {
        userId: session.user.id,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
        completed: false,
      },
    })

    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId: session.user.id,
        taskId: parsed.data.taskId || null,
        duration: parsed.data.duration,
        type: parsed.data.type,
        startedAt: new Date(),
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
    })

    return { success: true, data: pomodoroSession }
  } catch (error) {
    console.error('Error starting pomodoro:', error)
    return { success: false, error: 'Wystąpił błąd podczas uruchamiania pomodoro' }
  }
}

export async function completePomodoro(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Musisz być zalogowany' }
  }

  try {
    const pomodoroSession = await prisma.pomodoroSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    })

    if (!pomodoroSession) {
      return { success: false, error: 'Sesja nie znaleziona' }
    }

    const updated = await prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        completed: true,
      },
    })

    
    if (pomodoroSession.type === 'WORK') {
      const xpGained = Math.floor(pomodoroSession.duration * 2) 
      await addXpToUser(session.user.id, xpGained)
      
      
      await checkPomodoroAchievements(session.user.id)
    }

    revalidatePath('/dashboard')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Error completing pomodoro:', error)
    return { success: false, error: 'Wystąpił błąd podczas kończenia pomodoro' }
  }
}

export async function cancelPomodoro(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Musisz być zalogowany' }
  }

  try {
    await prisma.pomodoroSession.update({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      data: {
        endedAt: new Date(),
        completed: false,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error canceling pomodoro:', error)
    return { success: false, error: 'Wystąpił błąd podczas anulowania pomodoro' }
  }
}

export async function getActivePomodoro(): Promise<PomodoroSession | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  try {
    const active = await prisma.pomodoroSession.findFirst({
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

    return active
  } catch (error) {
    console.error('Error getting active pomodoro:', error)
    return null
  }
}

export async function getPomodoroStats(): Promise<PomodoroStats> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      todaySessions: 0,
      todayMinutes: 0,
      weekSessions: 0,
      weekMinutes: 0,
      totalSessions: 0,
      totalMinutes: 0,
    }
  }

  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    const [todaySessions, weekSessions, totalSessions] = await Promise.all([
      prisma.pomodoroSession.findMany({
        where: {
          userId: session.user.id,
          completed: true,
          type: 'WORK',
          startedAt: { gte: startOfDay },
        },
        select: { duration: true },
      }),
      prisma.pomodoroSession.findMany({
        where: {
          userId: session.user.id,
          completed: true,
          type: 'WORK',
          startedAt: { gte: startOfWeek },
        },
        select: { duration: true },
      }),
      prisma.pomodoroSession.findMany({
        where: {
          userId: session.user.id,
          completed: true,
          type: 'WORK',
        },
        select: { duration: true },
      }),
    ])

    return {
      todaySessions: todaySessions.length,
      todayMinutes: todaySessions.reduce((sum, s) => sum + s.duration, 0),
      weekSessions: weekSessions.length,
      weekMinutes: weekSessions.reduce((sum, s) => sum + s.duration, 0),
      totalSessions: totalSessions.length,
      totalMinutes: totalSessions.reduce((sum, s) => sum + s.duration, 0),
    }
  } catch (error) {
    console.error('Error getting pomodoro stats:', error)
    return {
      todaySessions: 0,
      todayMinutes: 0,
      weekSessions: 0,
      weekMinutes: 0,
      totalSessions: 0,
      totalMinutes: 0,
    }
  }
}

export async function getRecentPomodoros(limit = 10): Promise<PomodoroSession[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const sessions = await prisma.pomodoroSession.findMany({
      where: {
        userId: session.user.id,
        completed: true,
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    })

    return sessions
  } catch (error) {
    console.error('Error getting recent pomodoros:', error)
    return []
  }
}



async function addXpToUser(userId: string, xp: number) {
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

  
  await checkLevelAchievements(userId, newLevel)
}

async function checkPomodoroAchievements(userId: string) {
  const totalPomodoros = await prisma.pomodoroSession.count({
    where: {
      userId,
      completed: true,
      type: 'WORK',
    },
  })

  const achievementCodes: string[] = []
  if (totalPomodoros >= 1) achievementCodes.push('pomodoro_1')
  if (totalPomodoros >= 25) achievementCodes.push('pomodoro_25')
  if (totalPomodoros >= 100) achievementCodes.push('pomodoro_100')

  for (const code of achievementCodes) {
    await unlockAchievement(userId, code)
  }
}

async function checkLevelAchievements(userId: string, level: number) {
  const achievementCodes: string[] = []
  if (level >= 5) achievementCodes.push('level_5')
  if (level >= 10) achievementCodes.push('level_10')
  if (level >= 25) achievementCodes.push('level_25')
  if (level >= 50) achievementCodes.push('level_50')

  for (const code of achievementCodes) {
    await unlockAchievement(userId, code)
  }
}

export async function unlockAchievement(userId: string, achievementCode: string) {
  try {
    const achievement = await prisma.achievement.findUnique({
      where: { code: achievementCode },
    })

    if (!achievement) return null

    
    const existing = await prisma.userAchievement.findFirst({
      where: {
        userId,
        achievementId: achievement.id,
      },
    })

    if (existing) return null

    
    const unlocked = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
      include: {
        achievement: true,
      },
    })

    return unlocked
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return null
  }
}
