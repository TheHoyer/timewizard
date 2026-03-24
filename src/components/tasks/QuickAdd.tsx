'use client'

import { useState, useRef, useEffect } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { createTask } from '@/lib/actions/tasks'
import { useToast } from '@/components/ui/Toast'

interface QuickAddProps {
  onTaskCreated?: () => void
  defaultCategoryId?: string
  className?: string
}

export function QuickAdd({ onTaskCreated, defaultCategoryId, className }: QuickAddProps) {
  const { success: showSuccess, error: showError } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    setIsSubmitting(true)

    const formData = new FormData()
    formData.set('title', title.trim())
    formData.set('priority', '2') 
    formData.set('estimatedMinutes', '30') 
    if (defaultCategoryId) {
      formData.set('categoryId', defaultCategoryId)
    }

    const result = await createTask({}, formData)

    setIsSubmitting(false)

    if (result.success) {
      showSuccess('Zadanie utworzone', `"${title}" zostało dodane`)
      setTitle('')
      setIsExpanded(false)
      onTaskCreated?.()
    } else {
      showError('Błąd', result.error || 'Nie udało się utworzyć zadania')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false)
      setTitle('')
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Wpisz tytuł zadania i naciśnij Enter..."
                disabled={isSubmitting}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border-2 border-violet-300 dark:border-violet-600',
                  'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                  'transition-all duration-200',
                  isSubmitting && 'opacity-50'
                )}
              />
              {isSubmitting && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false)
                setTitle('')
              }}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </motion.form>
        ) : (
          <motion.button
            key="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsExpanded(true)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
              'border-2 border-dashed border-slate-300 dark:border-slate-600',
              'text-slate-500 dark:text-slate-400',
              'hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400',
              'hover:bg-violet-50 dark:hover:bg-violet-900/10',
              'transition-all duration-200',
              'group'
            )}
          >
            <PlusIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-medium">Szybkie dodawanie zadania...</span>
            <kbd className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-400">
              Enter
            </kbd>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
