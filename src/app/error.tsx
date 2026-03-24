'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HomeIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    void fetch('/api/monitoring/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'client',
        context: 'global-error-boundary',
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        path: window.location.pathname,
        severity: 'critical',
      }),
    }).catch((reportingError) => {
      console.error('Monitoring report failed:', reportingError)
    })
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8 flex justify-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 shadow-2xl shadow-red-500/25"
          >
            <ExclamationTriangleIcon className="w-20 h-20 text-white" />
          </motion.div>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Coś poszło nie tak
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">
            Przepraszamy, wystąpił nieoczekiwany błąd. 
            Nasz zespół został powiadomiony.
          </p>
          
          
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.4 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-left"
            >
              <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-400 dark:text-red-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Spróbuj ponownie
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
          >
            <HomeIcon className="w-5 h-5" />
            Strona główna
          </Link>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Potrzebujesz pomocy?{' '}
            <a href="mailto:support@timewizard.pl" className="text-violet-600 dark:text-violet-400 hover:underline">
              Skontaktuj się z nami
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
