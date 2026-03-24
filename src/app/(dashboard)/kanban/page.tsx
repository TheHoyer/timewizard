import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTasks } from '@/lib/actions/tasks'
import { getCategories } from '@/lib/actions/categories'
import { KanbanClientPage } from './KanbanClientPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kanban | TimeWizard',
  description: 'Widok tablicy Kanban do zarządzania zadaniami.',
}

export default async function KanbanPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  
  const [tasksResult, categoriesResult] = await Promise.all([
    getTasks({}),
    getCategories(),
  ])

  const tasks = tasksResult.success ? tasksResult.data || [] : []
  const categories = categoriesResult.success ? categoriesResult.data || [] : []

  return <KanbanClientPage initialTasks={tasks} initialCategories={categories} />
}
