import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTasks } from '@/lib/actions/tasks'
import { FocusClientPage } from './FocusClientPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tryb Skupienia | TimeWizard',
  description: 'Skup się na jednym zadaniu bez rozpraszaczy.',
}

export default async function FocusPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Fetch tasks that are not completed
  const tasksResult = await getTasks({ status: 'PENDING' })

  const inProgressResult = await getTasks({ status: 'IN_PROGRESS' })
  
  const pendingTasks = tasksResult.success ? tasksResult.data || [] : []
  const inProgressTasks = inProgressResult.success ? inProgressResult.data || [] : []
  // Combine and sort by priority
  const allTasks = [...inProgressTasks, ...pendingTasks]
    .sort((a, b) => b.priority - a.priority)

  return <FocusClientPage initialTasks={allTasks} />
}
