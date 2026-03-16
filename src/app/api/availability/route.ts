import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateAvailabilitySchema } from '@/lib/validations/availability'
import { reportError } from '@/lib/monitoring/reportError'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const blocks = await prisma.availabilityBlock.findMany({
      where: { userId: session.user.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json(blocks)
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-availability-get',
      message: error instanceof Error ? error.message : 'Unknown availability fetch error',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'error',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateAvailabilitySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { blocks } = validation.data

    // Delete existing blocks and create new ones (transaction)
    await prisma.$transaction([
      prisma.availabilityBlock.deleteMany({
        where: { userId: session.user.id },
      }),
      prisma.availabilityBlock.createMany({
        data: blocks.map((block) => ({
          userId: session.user.id,
          dayOfWeek: block.dayOfWeek,
          startTime: block.startTime,
          endTime: block.endTime,
          blockType: block.blockType,
        })),
      }),
    ])

    const updatedBlocks = await prisma.availabilityBlock.findMany({
      where: { userId: session.user.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json(updatedBlocks)
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-availability-put',
      message: error instanceof Error ? error.message : 'Unknown availability update error',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'error',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
