import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateSchedule } from '@/lib/scheduling/algorithm'
import { reportError } from '@/lib/monitoring/reportError'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (startDate && endDate) {
      where.scheduledStart = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const scheduledTasks = await prisma.scheduledTask.findMany({
      where,
      include: {
        task: {
          include: { category: true },
        },
      },
      orderBy: { scheduledStart: 'asc' },
    })

    return NextResponse.json(scheduledTasks)
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-schedule-get',
      message: error instanceof Error ? error.message : 'Unknown schedule fetch error',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'error',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const daysAhead = parseInt(searchParams.get('daysAhead') || '7')

    // Get user's tasks and availability
    const [tasks, availabilityBlocks] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId: session.user.id,
          deletedAt: null,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        include: { category: true },
      }),
      prisma.availabilityBlock.findMany({
        where: { userId: session.user.id },
      }),
    ])

    if (availabilityBlocks.length === 0) {
      return NextResponse.json(
        { error: 'No availability', message: 'Najpierw ustaw swoje bloki dostępności' },
        { status: 400 }
      )
    }

    // Generate schedule
    const schedule = generateSchedule(tasks, availabilityBlocks, new Date(), daysAhead)

    // Clear existing non-locked scheduled tasks for this period
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysAhead)

    await prisma.scheduledTask.deleteMany({
      where: {
        userId: session.user.id,
        isLocked: false,
        scheduledStart: {
          gte: new Date(),
          lte: endDate,
        },
      },
    })

    // Create new scheduled tasks
    if (schedule.length > 0) {
      await prisma.scheduledTask.createMany({
        data: schedule.map((item) => ({
          userId: session.user.id,
          taskId: item.taskId,
          scheduledStart: item.scheduledStart,
          scheduledEnd: item.scheduledEnd,
          isLocked: false,
        })),
      })
    }

    // Fetch the created schedule with task details
    const scheduledTasks = await prisma.scheduledTask.findMany({
      where: {
        userId: session.user.id,
        scheduledStart: {
          gte: new Date(),
          lte: endDate,
        },
      },
      include: {
        task: {
          include: { category: true },
        },
      },
      orderBy: { scheduledStart: 'asc' },
    })

    return NextResponse.json({
      message: 'Schedule generated successfully',
      scheduled: scheduledTasks.length,
      tasks: scheduledTasks,
    })
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-schedule-post',
      message: error instanceof Error ? error.message : 'Unknown schedule generation error',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'error',
    })
    return NextResponse.json({ error: 'Wystąpił błąd podczas generowania harmonogramu' }, { status: 500 })
  }
}
