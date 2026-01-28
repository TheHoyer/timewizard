'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export type PlanInfo = {
  plan: string
  limits: {
    maxTasks: number
    maxCategories: number
    historyDays: number
    features: string[]
  }
  usage: {
    tasksCount: number
    categoriesCount: number
  }
}

export async function getPlanInfo(): Promise<{ success: true; data: PlanInfo } | { success: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Musisz być zalogowany' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    })

    const plan = user?.plan || 'FREE'

    // Get plan limits
    const planLimit = await prisma.planLimit.findUnique({
      where: { plan },
    })

    if (!planLimit) {
      return { success: false, error: 'Nie znaleziono limitu planu' }
    }

    // Get current usage
    const [tasksCount, categoriesCount] = await Promise.all([
      prisma.task.count({
        where: { userId: session.user.id, deletedAt: null },
      }),
      prisma.category.count({
        where: { userId: session.user.id },
      }),
    ])

    let features: string[] = []
    try {
      features = JSON.parse(planLimit.features)
    } catch {
      features = []
    }

    return {
      success: true,
      data: {
        plan,
        limits: {
          maxTasks: planLimit.maxTasks,
          maxCategories: planLimit.maxCategories,
          historyDays: planLimit.historyDays,
          features,
        },
        usage: {
          tasksCount,
          categoriesCount,
        },
      },
    }
  } catch (error) {
    console.error('Get plan info error:', error)
    return { success: false, error: 'Nie udało się pobrać informacji o planie' }
  }
}

export async function checkPlanLimit(resource: 'tasks' | 'categories'): Promise<{ allowed: boolean; current: number; max: number }> {
  const result = await getPlanInfo()
  
  if (!result.success) {
    return { allowed: false, current: 0, max: 0 }
  }

  const { limits, usage } = result.data

  if (resource === 'tasks') {
    const max = limits.maxTasks
    const current = usage.tasksCount
    return { 
      allowed: max === -1 || current < max, 
      current, 
      max: max === -1 ? Infinity : max 
    }
  }

  if (resource === 'categories') {
    const max = limits.maxCategories
    const current = usage.categoriesCount
    return { 
      allowed: max === -1 || current < max, 
      current, 
      max: max === -1 ? Infinity : max 
    }
  }

  return { allowed: true, current: 0, max: Infinity }
}

export async function hasFeature(feature: string): Promise<boolean> {
  const result = await getPlanInfo()
  
  if (!result.success) {
    return false
  }

  return result.data.limits.features.includes(feature)
}
