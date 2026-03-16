import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTasks } from '@/lib/actions/tasks'
import { PlannerClientPage } from './PlannerClientPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planowanie dnia | TimeWizard',
  description: 'Zaplanuj swój dzień z blokami czasowymi.',
}

export default async function PlannerPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Fetch tasks
  const tasksResult = await getTasks({})

  const tasks = tasksResult.success ? tasksResult.data || [] : []
  return <PlannerClientPage initialTasks={tasks} />
}
