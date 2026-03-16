import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createCategorySchema } from '@/lib/validations/category'
import { reportError } from '@/lib/monitoring/reportError'
import { PLAN_LIMITS } from '@/lib/utils/constants'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-categories-get',
      message: error instanceof Error ? error.message : 'Unknown categories fetch error',
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

    const body = await request.json()
    const validation = createCategorySchema.safeParse(body)

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
    const categoryCount = await prisma.category.count({
      where: { userId: session.user.id },
    })

    if (categoryCount >= planLimits.maxCategories) {
      return NextResponse.json(
        { error: 'Category limit reached', message: 'Ulepsz plan, aby dodać więcej kategorii' },
        { status: 403 }
      )
    }

    const data = validation.data
    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-categories-post',
      message: error instanceof Error ? error.message : 'Unknown categories create error',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'error',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
