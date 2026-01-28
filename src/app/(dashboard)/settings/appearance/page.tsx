'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  LanguageIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useTheme } from '@/components/ui/ThemeProvider'

const ACCENT_COLORS = [
  { name: 'Fiolet', value: 'violet', class: 'bg-violet-500' },
  { name: 'Niebieski', value: 'blue', class: 'bg-blue-500' },
  { name: 'Zielony', value: 'green', class: 'bg-green-500' },
  { name: 'Różowy', value: 'pink', class: 'bg-pink-500' },
  { name: 'Pomarańczowy', value: 'orange', class: 'bg-orange-500' },
  { name: 'Czerwony', value: 'red', class: 'bg-red-500' },
]

export default function AppearancePage() {
  const { success: showSuccess } = useToast()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [accentColor, setAccentColor] = useState('violet')
  const [compactMode, setCompactMode] = useState(false)
  const [animations, setAnimations] = useState(true)

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    showSuccess('Motyw zmieniony!', `Przełączono na motyw: ${newTheme === 'light' ? 'jasny' : newTheme === 'dark' ? 'ciemny' : 'systemowy'}`)
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    showSuccess('Zapisano!', 'Ustawienia wyglądu zostały zaktualizowane')
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <PaintBrushIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Wygląd</h2>
            <p className="text-white/80">Dostosuj wygląd aplikacji do swoich preferencji</p>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Motyw</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', name: 'Jasny', icon: SunIcon },
            { id: 'dark', name: 'Ciemny', icon: MoonIcon },
            { id: 'system', name: 'Systemowy', icon: ComputerDesktopIcon },
          ].map((option) => {
            const Icon = option.icon
            const isSelected = theme === option.id
            return (
              <button
                key={option.id}
                onClick={() => handleThemeChange(option.id as 'light' | 'dark' | 'system')}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                  isSelected
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"
                  >
                    <CheckIcon className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                <Icon className={cn(
                  'w-6 h-6',
                  isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'
                )} />
                <span className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-300'
                )}>
                  {option.name}
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Aktualny motyw: <span className="font-medium text-slate-700 dark:text-slate-300">{resolvedTheme === 'dark' ? 'Ciemny' : 'Jasny'}</span>
        </p>
      </div>

      {/* Accent Color */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <SwatchIcon className="w-5 h-5 text-violet-600" />
          Kolor akcentowy
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Wybierz główny kolor interfejsu
        </p>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={cn(
                'w-12 h-12 rounded-xl transition-all',
                color.class,
                accentColor === color.value
                  ? 'ring-4 ring-offset-2 ring-slate-300 dark:ring-offset-slate-800 dark:ring-slate-600 scale-110'
                  : 'hover:scale-105'
              )}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Other Options */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
        {/* Compact Mode */}
        <div className="p-5 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">Tryb kompaktowy</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Zmniejsz odstępy i rozmiary elementów
            </p>
          </div>
          <button
            onClick={() => setCompactMode(!compactMode)}
            className={cn(
              'relative w-12 h-7 rounded-full transition-colors',
              compactMode ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-600'
            )}
          >
            <motion.div
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
              animate={{ left: compactMode ? '24px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Animations */}
        <div className="p-5 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">Animacje</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Włącz płynne animacje i przejścia
            </p>
          </div>
          <button
            onClick={() => setAnimations(!animations)}
            className={cn(
              'relative w-12 h-7 rounded-full transition-colors',
              animations ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-600'
            )}
          >
            <motion.div
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
              animate={{ left: animations ? '24px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <LanguageIcon className="w-5 h-5 text-violet-600" />
          Język
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Wybierz język interfejsu
        </p>
        <select
          defaultValue="pl"
          className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          <option value="pl">🇵🇱 Polski</option>
          <option value="en">🇬🇧 English</option>
          <option value="de">🇩🇪 Deutsch</option>
        </select>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isLoading}>
          Zapisz ustawienia
        </Button>
      </div>
    </div>
  )
}
