'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

interface NotificationSetting {
  id: string
  title: string
  description: string
  icon: React.ElementType
  enabled: boolean
}

export default function NotificationsPage() {
  const { success: showSuccess } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'email_reminders',
      title: 'Przypomnienia email',
      description: 'Otrzymuj przypomnienia o nadchodzących zadaniach na email',
      icon: EnvelopeIcon,
      enabled: true,
    },
    {
      id: 'push_notifications',
      title: 'Powiadomienia push',
      description: 'Otrzymuj powiadomienia push w przeglądarce',
      icon: BellIcon,
      enabled: false,
    },
    {
      id: 'mobile_notifications',
      title: 'Powiadomienia mobilne',
      description: 'Powiadomienia na urządzenia mobilne (wkrótce)',
      icon: DevicePhoneMobileIcon,
      enabled: false,
    },
    {
      id: 'desktop_notifications',
      title: 'Powiadomienia desktop',
      description: 'Powiadomienia na pulpicie komputera',
      icon: ComputerDesktopIcon,
      enabled: true,
    },
    {
      id: 'daily_digest',
      title: 'Podsumowanie dnia',
      description: 'Codzienny email z podsumowaniem zadań',
      icon: ClockIcon,
      enabled: false,
    },
  ])

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    showSuccess('Zapisano!', 'Ustawienia powiadomień zostały zaktualizowane')
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <BellIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Powiadomienia</h2>
            <p className="text-white/80">Zdecyduj jak i kiedy chcesz otrzymywać powiadomienia</p>
          </div>
        </div>
      </div>

      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
        {settings.map((setting, index) => {
          const Icon = setting.icon
          return (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'p-3 rounded-xl',
                  setting.enabled 
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {setting.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {setting.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(setting.id)}
                className={cn(
                  'relative w-12 h-7 rounded-full transition-colors',
                  setting.enabled ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-600'
                )}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
                  animate={{ left: setting.enabled ? '24px' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </motion.div>
          )
        })}
      </div>

      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-violet-600" />
          Godziny ciszy
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Ustaw godziny, w których nie chcesz otrzymywać powiadomień
        </p>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Od</label>
            <input
              type="time"
              defaultValue="22:00"
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <span className="text-slate-400 mt-6">—</span>
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Do</label>
            <input
              type="time"
              defaultValue="08:00"
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isLoading}>
          Zapisz ustawienia
        </Button>
      </div>
    </div>
  )
}
