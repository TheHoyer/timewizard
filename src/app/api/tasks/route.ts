import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createTaskSchema } from '@/lib/validations/task'
import { PLAN_LIMITS } from '@/lib/utils/constants'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {
      userId: session.user.id,
      deletedAt: null,
    }

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: { category: true },
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({ tasks, total, limit, offset })
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createTaskSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Check plan limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const planLimits = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS]
    const taskCount = await prisma.task.count({
      where: {
        userId: session.user.id,
        deletedAt: null,
        status: { not: 'COMPLETED' },
      },
    })

    if (taskCount >= planLimits.maxTasks) {
      return NextResponse.json(
        { error: 'Task limit reached', message: 'Ulepsz plan, aby dodać więcej zadań' },
        { status: 403 }
      )
    }

    const data = validation.data
    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        estimatedMinutes: data.estimatedMinutes,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        categoryId: data.categoryId,
        isRecurring: data.isRecurring,
        recurringType: data.recurringType,
        recurringDays: data.recurringDays ? JSON.stringify(data.recurringDays) : null,
        recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null,
      },
      include: { category: true },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
