'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/Input'
import { requestPasswordReset } from '@/lib/actions/password'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setErrors({})
    setMessage('')

    const result = await requestPasswordReset(formData)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Sprawdź swoją skrzynkę
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Jeśli konto z podanym adresem email istnieje, wysłaliśmy link do resetowania hasła. 
              Link jest ważny przez 1 godzinę.
            </p>
            
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Wróć do logowania
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

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

        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Zapomniałeś hasła?
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Podaj swój email, a wyślemy Ci link do resetowania hasła.
            </p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="twoj@email.pl"
              autoComplete="email"
              error={errors.email}
              required
            />

            {message && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
              </div>
            )}

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
                  Wysyłanie...
                </span>
              ) : (
                'Wyślij link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Wróć do logowania
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
