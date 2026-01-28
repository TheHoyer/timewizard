import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTasks } from '@/lib/actions/tasks'
import { getCategories } from '@/lib/actions/categories'
import { TasksClientPage } from './TasksClientPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zadania | TimeWizard',
  description: 'Zarządzaj swoimi zadaniami, śledź postępy i osiągaj cele.',
}

export default async function TasksPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Fetch initial data
  const [tasksResult, categoriesResult] = await Promise.all([
    getTasks({}),
    getCategories(),
  ])

  const tasks = tasksResult.success ? tasksResult.data || [] : []
  const categories = categoriesResult.success ? categoriesResult.data || [] : []

  return <TasksClientPage initialTasks={tasks} initialCategories={categories} />
}
