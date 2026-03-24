import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Sidebar, Header } from '@/components/layout'
import { CommandPaletteProvider } from '@/components/providers/CommandPaletteProvider'

import { getCategories } from '@/lib/actions/categories'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  
  const categoriesResult = await getCategories()
  const categories = categoriesResult.success ? categoriesResult.data ?? [] : []

  return (
    <CommandPaletteProvider categories={categories}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
        
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200/30 dark:bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <Sidebar />
        <div className="lg:ml-64 relative">
          <Header />
          <main className="p-4 lg:p-6 pt-16 lg:pt-6">{children}</main>
        </div>
      </div>
    </CommandPaletteProvider>
  )
}
