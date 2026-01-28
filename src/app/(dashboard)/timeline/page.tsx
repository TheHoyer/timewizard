import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { TimelineClient } from './TimelineClient'

export const metadata = {
  title: 'Timeline | TimeWizard',
  description: 'Widok osi czasu zadań',
}

export default async function TimelinePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Get tasks with due dates for the next 30 days
  const now = new Date()
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      dueDate: {
        gte: now,
        lte: endDate,
      },
    },
    include: { category: true },
    orderBy: { dueDate: 'asc' },
  })

  // Get overdue tasks
  const overdueTasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      status: { not: 'COMPLETED' },
      dueDate: {
        lt: now,
      },
    },
    include: { category: true },
    orderBy: { dueDate: 'asc' },
  })

  return <TimelineClient tasks={tasks} overdueTasks={overdueTasks} />
}
