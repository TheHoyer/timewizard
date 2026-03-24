'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'



export type Achievement = {
  id: string
  code: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date | null
  isUnlocked: boolean
}

export type UserStats = {
  xp: number
  level: number
  xpToNextLevel: number
  xpProgress: number
  streakCount: number
  totalTasksCompleted: number
  achievementsUnlocked: number
  totalAchievements: number
}



export async function getAllAchievements(): Promise<Achievement[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const [achievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany({
        orderBy: { code: 'asc' },
      }),
      prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        select: { achievementId: true, unlockedAt: true },
      }),
    ])

    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua.unlockedAt])
    )

    return achievements.map(a => ({
      id: a.id,
      code: a.code,
      name: a.name,
      description: a.description,
      icon: a.icon,
      unlockedAt: unlockedMap.get(a.id) || null,
      isUnlocked: unlockedMap.has(a.id),
    }))
  } catch (error) {
    console.error('Error getting achievements:', error)
    return []
  }
}

export async function getUnlockedAchievements(): Promise<Achievement[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    })

    return userAchievements.map(ua => ({
      id: ua.achievement.id,
      code: ua.achievement.code,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      unlockedAt: ua.unlockedAt,
      isUnlocked: true,
    }))
  } catch (error) {
    console.error('Error getting unlocked achievements:', error)
    return []
  }
}

export async function getUserStats(): Promise<UserStats | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  try {
    const [user, achievementsCount, unlockedCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          xp: true,
          level: true,
          streakCount: true,
          totalTasksCompleted: true,
        },
      }),
      prisma.achievement.count(),
      prisma.userAchievement.count({
        where: { userId: session.user.id },
      }),
    ])

    if (!user) return null

    const xpForNextLevel = user.level * 100 + Math.floor(user.level / 5) * 50
    const currentLevelXp = calculateCurrentLevelXp(user.xp, user.level)
    const xpProgress = Math.min(100, Math.floor((currentLevelXp / xpForNextLevel) * 100))

    return {
      xp: user.xp,
      level: user.level,
      xpToNextLevel: xpForNextLevel - currentLevelXp,
      xpProgress,
      streakCount: user.streakCount,
      totalTasksCompleted: user.totalTasksCompleted,
      achievementsUnlocked: unlockedCount,
      totalAchievements: achievementsCount,
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return null
  }
}

export async function getRecentAchievements(): Promise<Achievement[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
      take: 5,
    })

    return userAchievements.map(ua => ({
      id: ua.achievement.id,
      code: ua.achievement.code,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      unlockedAt: ua.unlockedAt,
      isUnlocked: true,
    }))
  } catch (error) {
    console.error('Error getting recent achievements:', error)
    return []
  }
}

export async function updateUserStreak() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { streakCount: true, lastActiveAt: true },
    })

    if (!user) return { success: false }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastActive = user.lastActiveAt 
      ? new Date(user.lastActiveAt.getFullYear(), user.lastActiveAt.getMonth(), user.lastActiveAt.getDate())
      : null

    let newStreak = user.streakCount

    if (!lastActive) {
      
      newStreak = 1
    } else {
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 0) {
        
        newStreak = user.streakCount
      } else if (daysDiff === 1) {
        
        newStreak = user.streakCount + 1
      } else {
        
        newStreak = 1
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        streakCount: newStreak,
        lastActiveAt: now,
      },
    })

    
    await checkStreakAchievements(session.user.id, newStreak)

    return { success: true, streak: newStreak }
  } catch (error) {
    console.error('Error updating streak:', error)
    return { success: false }
  }
}

export async function awardXp(amount: number, reason: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false }
  }

  void reason

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, level: true },
    })

    if (!user) return { success: false }

    const newXp = user.xp + amount
    let newLevel = user.level
    
    
    while (calculateCurrentLevelXp(newXp, newLevel) >= xpForLevel(newLevel)) {
      newLevel++
    }

    const leveledUp = newLevel > user.level

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        xp: newXp,
        level: newLevel,
      },
    })

    
    if (leveledUp) {
      await checkLevelAchievements(session.user.id, newLevel)
    }

    return { 
      success: true, 
      xp: newXp, 
      level: newLevel, 
      leveledUp,
      xpGained: amount,
    }
  } catch (error) {
    console.error('Error awarding XP:', error)
    return { success: false }
  }
}



function xpForLevel(level: number): number {
  return level * 100 + Math.floor(level / 5) * 50
}

function calculateCurrentLevelXp(totalXp: number, level: number): number {
  let xpUsed = 0
  for (let l = 1; l < level; l++) {
    xpUsed += xpForLevel(l)
  }
  return totalXp - xpUsed
}

async function checkStreakAchievements(userId: string, streak: number) {
  const { unlockAchievement } = await import('./pomodoro')
  
  const achievementCodes: string[] = []
  if (streak >= 3) achievementCodes.push('streak_3')
  if (streak >= 7) achievementCodes.push('streak_7')
  if (streak >= 30) achievementCodes.push('streak_30')
  if (streak >= 100) achievementCodes.push('streak_100')

  for (const code of achievementCodes) {
    await unlockAchievement(userId, code)
  }
}

async function checkLevelAchievements(userId: string, level: number) {
  const { unlockAchievement } = await import('./pomodoro')
  
  const achievementCodes: string[] = []
  if (level >= 5) achievementCodes.push('level_5')
  if (level >= 10) achievementCodes.push('level_10')
  if (level >= 25) achievementCodes.push('level_25')
  if (level >= 50) achievementCodes.push('level_50')

  for (const code of achievementCodes) {
    await unlockAchievement(userId, code)
  }
}

export async function checkTaskAchievements(userId: string) {
  const { unlockAchievement } = await import('./pomodoro')
  
  const totalCompleted = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalTasksCompleted: true },
  })

  if (!totalCompleted) return

  const count = totalCompleted.totalTasksCompleted
  const achievementCodes: string[] = []
  
  if (count >= 1) achievementCodes.push('first_task')
  if (count >= 10) achievementCodes.push('tasks_10')
  if (count >= 50) achievementCodes.push('tasks_50')
  if (count >= 100) achievementCodes.push('tasks_100')
  if (count >= 500) achievementCodes.push('tasks_500')

  for (const code of achievementCodes) {
    await unlockAchievement(userId, code)
  }

  
  const now = new Date()
  const hour = now.getHours()
  
  if (hour < 7) {
    await unlockAchievement(userId, 'early_bird')
  }
  if (hour >= 23) {
    await unlockAchievement(userId, 'night_owl')
  }
}

export async function checkCategoryAchievements(userId: string) {
  const { unlockAchievement } = await import('./pomodoro')
  
  const categoryCount = await prisma.category.count({
    where: { userId },
  })

  if (categoryCount >= 5) {
    await unlockAchievement(userId, 'category_master')
  }
}
