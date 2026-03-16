import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateTaskSchema } from '@/lib/validations/task'
import { reportError } from '@/lib/monitoring/reportError'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: { category: true },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-task-by-id-get',
      message: error instanceof Error ? error.message : 'Unknown task fetch error',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'error',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = updateTaskSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const data = validation.data
    
    // Build update data object properly
    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.estimatedMinutes !== undefined) updateData.estimatedMinutes = data.estimatedMinutes
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.status !== undefined) {
      updateData.status = data.status
      if (data.status === 'COMPLETED') updateData.completedAt = new Date()
    }
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring
    if (data.recurringType !== undefined) updateData.recurringType = data.recurringType
    if (data.recurringDays !== undefined) updateData.recurringDays = data.recurringDays ? JSON.stringify(data.recurringDays) : null
    if (data.recurringEndDate !== undefined) updateData.recurringEndDate = data.recurringEndDate ? new Date(data.recurringEndDate) : null
    
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { category: true },
    })

    // Update user stats if task completed
    if (data.status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalTasksCompleted: { increment: 1 },
          lastActiveAt: new Date(),
        },
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-task-by-id-put',
      message: error instanceof Error ? error.message : 'Unknown task update error',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'error',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Soft delete
    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-task-by-id-delete',
      message: error instanceof Error ? error.message : 'Unknown task delete error',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'error',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
