'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LockClosedIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/Input'
import { resetPassword } from '@/lib/actions/password'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState('')

  if (!token) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Nieprawidłowy link
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Link do resetowania hasła jest nieprawidłowy lub wygasł.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Poproś o nowy link
        </Link>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setErrors({})
    setMessage('')

    formData.append('token', token!)
    const result = await resetPassword(formData)

    if (result.success) {
      setIsSuccess(true)
    } else {
      if (result.errors) {
        setErrors(result.errors)
      }
      if (result.message) {
        setMessage(result.message)
      }
    }

    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </motion.div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Hasło zmienione!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Twoje hasło zostało pomyślnie zmienione. Możesz teraz zalogować się nowym hasłem.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Przejdź do logowania
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
          <LockClosedIcon className="w-7 h-7 text-violet-600 dark:text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Ustaw nowe hasło
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Wprowadź nowe hasło dla swojego konta.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <Input
          label="Nowe hasło"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password}
          required
        />

        <Input
          label="Potwierdź hasło"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
        />

        {message && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
          </div>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Hasło musi zawierać:
          <ul className="mt-1 space-y-1 ml-4">
            <li>• Minimum 8 znaków</li>
            <li>• Małą literę (a-z)</li>
            <li>• Wielką literę (A-Z)</li>
            <li>• Cyfrę (0-9)</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Zapisywanie...
            </span>
          ) : (
            'Zmień hasło'
          )}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">⏰</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              TimeWizard
            </span>
          </Link>
        </div>

        <Suspense fallback={
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-pulse">
              <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-xl mx-auto mb-4" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mx-auto mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 mx-auto" />
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
