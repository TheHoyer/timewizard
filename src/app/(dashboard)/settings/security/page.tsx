'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { Button, Input } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

export default function SecurityPage() {
  const { success: showSuccess, error: showError } = useToast()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showError('Błąd', 'Hasła nie są identyczne')
      return
    }
    if (newPassword.length < 8) {
      showError('Błąd', 'Hasło musi mieć minimum 8 znaków')
      return
    }
    
    setIsChangingPassword(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    showSuccess('Hasło zmienione!', 'Twoje hasło zostało pomyślnie zaktualizowane')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setIsChangingPassword(false)
  }

  const sessions = [
    {
      device: 'Chrome na macOS',
      location: 'Warszawa, Polska',
      lastActive: 'Teraz',
      current: true,
    },
    {
      device: 'Safari na iPhone',
      location: 'Warszawa, Polska',
      lastActive: '2 godziny temu',
      current: false,
    },
    {
      device: 'Firefox na Windows',
      location: 'Kraków, Polska',
      lastActive: '3 dni temu',
      current: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Bezpieczeństwo</h2>
            <p className="text-white/80">Zarządzaj hasłem i zabezpieczeniami konta</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <KeyIcon className="w-5 h-5 text-violet-600" />
          Zmiana hasła
        </h3>
        <div className="space-y-4 max-w-md">
          <Input
            type="password"
            label="Obecne hasło"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Wprowadź obecne hasło"
          />
          <Input
            type="password"
            label="Nowe hasło"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 znaków"
          />
          <Input
            type="password"
            label="Potwierdź nowe hasło"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Powtórz nowe hasło"
          />
          <Button
            onClick={handleChangePassword}
            isLoading={isChangingPassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Zmień hasło
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={cn(
              'p-3 rounded-xl',
              twoFactorEnabled 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            )}>
              <DevicePhoneMobileIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Weryfikacja dwuetapowa (2FA)
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Dodaj dodatkową warstwę zabezpieczeń do swojego konta
              </p>
              {twoFactorEnabled && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  ✓ Włączone
                </span>
              )}
            </div>
          </div>
          <Button
            variant={twoFactorEnabled ? 'outline' : 'primary'}
            size="sm"
            onClick={() => {
              setTwoFactorEnabled(!twoFactorEnabled)
              showSuccess(
                twoFactorEnabled ? '2FA wyłączone' : '2FA włączone',
                twoFactorEnabled 
                  ? 'Weryfikacja dwuetapowa została wyłączona'
                  : 'Weryfikacja dwuetapowa została włączona'
              )
            }}
          >
            {twoFactorEnabled ? 'Wyłącz' : 'Włącz'}
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-violet-600" />
          Aktywne sesje
        </h3>
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-xl flex items-center justify-between',
                session.current 
                  ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800'
                  : 'bg-slate-50 dark:bg-slate-700/50'
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {session.device}
                  </span>
                  {session.current && (
                    <span className="text-xs bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
                      Obecna sesja
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {session.location} • {session.lastActive}
                </div>
              </div>
              {!session.current && (
                <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
        <button className="mt-4 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
          Wyloguj ze wszystkich innych urządzeń
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              Strefa niebezpieczeństwa
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Te akcje są nieodwracalne. Upewnij się, że wiesz co robisz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30">
                Pobierz wszystkie dane
              </Button>
              <Button variant="danger" size="sm">
                Usuń konto
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
