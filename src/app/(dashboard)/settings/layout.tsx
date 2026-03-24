'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  CreditCardIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'

const SETTINGS_NAV = [
  {
    name: 'Profil',
    href: '/settings/profile',
    icon: UserCircleIcon,
    description: 'Twoje dane i preferencje',
  },
  {
    name: 'Subskrypcja',
    href: '/settings/subscription',
    icon: CreditCardIcon,
    description: 'Plan i płatności',
  },
  {
    name: 'Powiadomienia',
    href: '/settings/notifications',
    icon: BellIcon,
    description: 'Ustawienia powiadomień',
  },
  {
    name: 'Wygląd',
    href: '/settings/appearance',
    icon: PaintBrushIcon,
    description: 'Motyw i personalizacja',
  },
  {
    name: 'Bezpieczeństwo',
    href: '/settings/security',
    icon: ShieldCheckIcon,
    description: 'Hasło i zabezpieczenia',
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="max-w-6xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Cog6ToothIcon className="w-8 h-8 text-violet-600" />
          Ustawienia
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Zarządzaj swoim kontem, subskrypcją i preferencjami aplikacji.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <nav className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 sticky top-6">
            <ul className="space-y-1">
              {SETTINGS_NAV.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group',
                        isActive
                          ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="settings-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-600 rounded-r-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                      <Icon className={cn(
                        'w-5 h-5 flex-shrink-0',
                        isActive ? 'text-violet-600 dark:text-violet-400' : ''
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'font-medium text-sm',
                          isActive ? 'text-violet-700 dark:text-violet-300' : ''
                        )}>
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        
        <main className="lg:col-span-3">
          {children}
        </main>
      </div>
    </div>
  )
}
