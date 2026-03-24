import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardClient } from './DashboardClient'
import { Task, Category } from '@prisma/client'
import { Metadata } from 'next'
import { startOfWeek, endOfWeek } from 'date-fns'

export const metadata: Metadata = {
  title: 'Dashboard | TimeWizard',
  description: 'Twój osobisty asystent produktywności',
}

type TaskWithCategory = Task & { category: Category | null }

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const [user, stats, recentTasks, categories, todayTasks, weeklyStats, recentAchievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        name: true, 
        streakCount: true, 
        totalTasksCompleted: true, 
        plan: true,
        createdAt: true,
        xp: true,
        level: true,
      },
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: { userId: session.user.id, deletedAt: null },
      _count: true,
    }),
    prisma.task.findMany({
      where: { userId: session.user.id, deletedAt: null, status: { not: 'COMPLETED' } },
      include: { category: true },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
      take: 5,
    }),
    prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    }),
    
    prisma.task.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        dueDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: { category: true },
      orderBy: { priority: 'desc' },
    }),
    
    prisma.task.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        createdAt: { gte: weekStart, lte: weekEnd },
      },
      select: { status: true },
    }),
    
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
      take: 3,
    }),
  ])

  type StatItem = { status: string; _count: number }
  const totalTasks = stats.reduce((acc: number, s: StatItem) => acc + s._count, 0)
  const pendingTasks = stats.find((s: StatItem) => s.status === 'PENDING')?._count || 0
  const inProgressTasks = stats.find((s: StatItem) => s.status === 'IN_PROGRESS')?._count || 0
  const completedTasks = stats.find((s: StatItem) => s.status === 'COMPLETED')?._count || 0

  
  const productivityPercent = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0

  
  const weeklyTotal = weeklyStats.length
  const weeklyCompleted = weeklyStats.filter((t: { status: string }) => t.status === 'COMPLETED').length

  return (
    <DashboardClient
      user={{
        name: user?.name || 'Użytkowniku',
        streakCount: user?.streakCount || 0,
        totalTasksCompleted: user?.totalTasksCompleted || 0,
        plan: user?.plan || 'FREE',
        memberSince: user?.createdAt || new Date(),
        xp: user?.xp || 0,
        level: user?.level || 1,
      }}
      stats={{
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        productivityPercent,
        weeklyCompleted,
        weeklyTotal,
      }}
      recentTasks={recentTasks as TaskWithCategory[]}
      todayTasks={todayTasks as TaskWithCategory[]}
      categories={categories}
      recentAchievements={recentAchievements.map((ua: { achievement: { id: string; name: string; description: string; icon: string }; unlockedAt: Date }) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        unlockedAt: ua.unlockedAt,
      }))}
    />
  )
}
