'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { getPlanInfo, type PlanInfo } from '@/lib/actions/plan'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SwatchIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  ViewColumnsIcon,
  EyeIcon,
  ClockIcon,
  TrophyIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Zadania', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Kanban', href: '/kanban', icon: ViewColumnsIcon },
  { name: 'Tryb Skupienia', href: '/focus', icon: EyeIcon, tutorialId: 'focus-link' },
  { name: 'Planner', href: '/planner', icon: ClockIcon },
  { name: 'Kategorie', href: '/categories', icon: SwatchIcon, tooltipId: 'categories', tutorialId: 'categories' },
  { name: 'Timeline', href: '/timeline', icon: CalendarDaysIcon },
  { name: 'Szablony', href: '/templates', icon: DocumentDuplicateIcon },
  { name: 'Statystyki', href: '/stats', icon: ChartBarIcon, tooltipId: 'statistics', tutorialId: 'stats' },
  { name: 'Osiągnięcia', href: '/achievements', icon: TrophyIcon, tutorialId: 'achievements-link' },
  { name: 'Eksport', href: '/export', icon: DocumentArrowDownIcon },
  { name: 'Ustawienia', href: '/settings', icon: Cog6ToothIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    getPlanInfo().then(result => {
      if (result.success) {
        setPlanInfo(result.data)
      }
    })
  }, [])

  const closeMobile = () => setIsMobileOpen(false)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">⏳</span>
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">TimeWizard</span>
        </div>
        <button
          onClick={closeMobile}
          className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <XMarkIcon className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobile}
              {...(item.tooltipId && { 'data-tooltip': item.tooltipId })}
              {...(item.tutorialId && { 'data-tutorial': item.tutorialId })}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <item.icon
                className={cn('w-5 h-5', isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400')}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Plan info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 rounded-lg p-4">
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wide">
            Plan {planInfo?.plan || 'Free'}
          </p>
          {planInfo && planInfo.limits.maxTasks !== -1 && (
            <>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                {planInfo.usage.tasksCount}/{planInfo.limits.maxTasks} zadań
              </p>
              <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (planInfo.usage.tasksCount / planInfo.limits.maxTasks) * 100)}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
      >
        <Bars3Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobile}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex-col">
        {sidebarContent}
      </aside>
    </>
  )
}
