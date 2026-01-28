import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getCategories } from '@/lib/actions/categories'
import { CategoriesClientPage } from './CategoriesClientPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kategorie | TimeWizard',
  description: 'Zarządzaj kategoriami zadań i organizuj swoją pracę.',
}

export default async function CategoriesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const result = await getCategories()
  const categories = result.success ? result.data || [] : []

  return <CategoriesClientPage initialCategories={categories} />
}
