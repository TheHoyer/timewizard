'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative mb-8"
        >
          <span className="text-[180px] font-black text-slate-100 dark:text-slate-800 select-none">
            404
          </span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 shadow-2xl shadow-violet-500/25">
              <MagnifyingGlassIcon className="w-16 h-16 text-white" />
            </div>
          </motion.div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Strona nie znaleziona
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
            Ups! Wygląda na to, że ta strona zaginęła w czasie. 
            Sprawdź adres URL lub wróć na stronę główną.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
          >
            <HomeIcon className="w-5 h-5" />
            Strona główna
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Wróć
          </button>
        </motion.div>

        {/* Fun animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-slate-400 dark:text-slate-500 text-sm"
        >
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨ TimeWizard szuka Twojej strony...
          </motion.span>
        </motion.div>
      </div>
    </div>
  )
}
