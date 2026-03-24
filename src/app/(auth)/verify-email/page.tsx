'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ExclamationTriangleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { verifyEmail } from '@/lib/actions/password'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => {
    
    return 'loading'
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeout = setTimeout(() => {
        setStatus('error')
        setMessage('Brak tokenu weryfikacyjnego')
      }, 0)
      return () => clearTimeout(timeout)
    }

    verifyEmail(token).then((result) => {
      if (result.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setMessage(result.message || 'Wystąpił błąd')
      }
    })
  }, [token])

  if (status === 'loading') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <EnvelopeIcon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </motion.div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Weryfikowanie email...
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Proszę czekać, trwa weryfikacja Twojego adresu email.
        </p>
      </div>
    )
  }

  if (status === 'success') {
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
          Email zweryfikowany! 🎉
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Twój adres email został pomyślnie potwierdzony. 
          Możesz teraz korzystać ze wszystkich funkcji TimeWizard.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Przejdź do dashboardu
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
      </motion.div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Weryfikacja nieudana
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Zaloguj się
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
        >
          Strona główna
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
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
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mx-auto mb-4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 mx-auto" />
            </div>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </motion.div>
    </div>
  )
}
