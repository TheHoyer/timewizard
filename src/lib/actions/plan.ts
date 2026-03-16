'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const COMMON_PLAN = {
  name: 'STANDARD',
  maxTasks: -1,
  maxCategories: -1,
  historyDays: -1,
  features: [
    'basic_tasks',
    'categories',
    'pomodoro',
    'basic_stats',
    'advanced_stats',
    'export_csv',
    'recurring_tasks',
    'ai_scheduling',
    'google_calendar',
    'unlimited_history',
    'priority_support',
    'team_workspaces',
    'api_access',
    'audit_log',
    'sso',
    'slack_integration',
  ],
} as const

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
    // Get current usage
    const [tasksCount, categoriesCount] = await Promise.all([
      prisma.task.count({
        where: { userId: session.user.id, deletedAt: null },
      }),
      prisma.category.count({
        where: { userId: session.user.id },
      }),
    ])

    return {
      success: true,
      data: {
        plan: COMMON_PLAN.name,
        limits: {
          maxTasks: COMMON_PLAN.maxTasks,
          maxCategories: COMMON_PLAN.maxCategories,
          historyDays: COMMON_PLAN.historyDays,
          features: [...COMMON_PLAN.features],
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
