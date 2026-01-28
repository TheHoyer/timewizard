import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTemplates } from '@/lib/actions/templates'
import { getCategories } from '@/lib/actions/categories'
import { TemplatesClient } from './TemplatesClient'

export const metadata = {
  title: 'Szablony | TimeWizard',
  description: 'Zarządzaj szablonami zadań',
}

export default async function TemplatesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const [templatesResult, categoriesResult] = await Promise.all([
    getTemplates(),
    getCategories(),
  ])

  const templates = templatesResult.success ? templatesResult.data ?? [] : []
  const categories = categoriesResult.success ? categoriesResult.data ?? [] : []

  return <TemplatesClient initialTemplates={templates} categories={categories} />
}
