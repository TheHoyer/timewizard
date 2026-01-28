'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, Category } from '@prisma/client'
import { cn } from '@/lib/utils/cn'
import { updateTaskStatus, getTasks } from '@/lib/actions/tasks'
import { useToast } from '@/components/ui/Toast'
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer'
import { TimeTracker } from '@/components/pomodoro/TimeTracker'
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListBulletIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/utils/constants'
import confetti from 'canvas-confetti'

type TaskWithCategory = Task & { category?: Category | null }

interface FocusClientPageProps {
  initialTasks: TaskWithCategory[]
  categories: Category[]
}

export function FocusClientPage({ initialTasks, categories }: FocusClientPageProps) {
  const { success: showSuccess } = useToast()
  const [tasks, setTasks] = useState<TaskWithCategory[]>(initialTasks)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showTaskList, setShowTaskList] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const currentTask = tasks[currentIndex]

  const refreshTasks = useCallback(async () => {
    const [pendingResult, inProgressResult] = await Promise.all([
      getTasks({ status: 'PENDING' }),
      getTasks({ status: 'IN_PROGRESS' }),
    ])
    
    const pending = pendingResult.success ? pendingResult.data || [] : []
    const inProgress = inProgressResult.success ? inProgressResult.data || [] : []
    
    const allTasks = [...inProgress, ...pending]
      .sort((a, b) => b.priority - a.priority)
    
    setTasks(allTasks)
    if (currentIndex >= allTasks.length) {
      setCurrentIndex(Math.max(0, allTasks.length - 1))
    }
  }, [currentIndex])

  const handleComplete = async () => {
    if (!currentTask || isCompleting) return
    
    setIsCompleting(true)
    
    // Celebrate
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
    })

    await updateTaskStatus(currentTask.id, 'COMPLETED')
    showSuccess('Świetna robota! 🎉', `"${currentTask.title}" ukończone!`)
    
    // Move to next task
    setTasks(prev => prev.filter(t => t.id !== currentTask.id))
    if (currentIndex >= tasks.length - 1) {
      setCurrentIndex(Math.max(0, tasks.length - 2))
    }
    
    setIsCompleting(false)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < tasks.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const selectTask = (index: number) => {
    setCurrentIndex(index)
    setShowTaskList(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Enter' && e.ctrlKey) handleComplete()
      if (e.key === 'Escape') setShowTaskList(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, tasks.length])

  if (tasks.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Wszystko zrobione!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            Nie masz żadnych zadań do wykonania. Czas na zasłużony odpoczynek 
            lub dodaj nowe zadania.
          </p>
        </motion.div>
      </div>
    )
  }

  const priorityColors = PRIORITY_COLORS[currentTask.priority as keyof typeof PRIORITY_COLORS]

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative">
      {/* Task list toggle */}
      <button
        onClick={() => setShowTaskList(!showTaskList)}
        className="absolute top-0 right-0 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <ListBulletIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Task counter */}
      <div className="absolute top-0 left-0 text-sm text-slate-500 dark:text-slate-400">
        Zadanie {currentIndex + 1} z {tasks.length}
      </div>

      {/* Main focus card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTask.id}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <div className={cn(
            'bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border-4',
            priorityColors.border
          )}>
            {/* Category & Priority */}
            <div className="flex items-center justify-between mb-6">
              {currentTask.category ? (
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${currentTask.category.color}20`,
                    color: currentTask.category.color,
                  }}
                >
                  {currentTask.category.icon && <span className="mr-1.5">{currentTask.category.icon}</span>}
                  {currentTask.category.name}
                </span>
              ) : (
                <div />
              )}
              <span className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium',
                priorityColors.bg,
                priorityColors.text
              )}>
                {PRIORITY_LABELS[currentTask.priority as keyof typeof PRIORITY_LABELS]}
              </span>
            </div>

            {/* Task title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 text-center">
              {currentTask.title}
            </h1>

            {/* Description */}
            {currentTask.description && (
              <p className="text-slate-600 dark:text-slate-300 text-center mb-6 max-w-lg mx-auto">
                {currentTask.description}
              </p>
            )}

            {/* Time info */}
            <div className="flex items-center justify-center gap-6 mb-8 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                {currentTask.estimatedMinutes} min szacowanego czasu
              </span>
            </div>

            {/* Pomodoro Timer */}
            <div className="mb-8">
              <PomodoroTimer 
                taskId={currentTask.id} 
                taskTitle={currentTask.title}
                onComplete={refreshTasks}
              />
            </div>

            {/* Time Tracker */}
            <div className="mb-8">
              <TimeTracker 
                taskId={currentTask.id}
                taskTitle={currentTask.title}
                onUpdate={refreshTasks}
              />
            </div>

            {/* Complete button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={isCompleting}
              className={cn(
                'w-full py-4 rounded-xl font-semibold text-lg transition-all',
                'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
                'hover:from-green-600 hover:to-emerald-700',
                'shadow-lg hover:shadow-xl',
                isCompleting && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <CheckIcon className="w-6 h-6" />
                {isCompleting ? 'Zapisywanie...' : 'Ukończ zadanie'}
              </span>
            </motion.button>

            {/* Keyboard hint */}
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
              Ctrl + Enter aby ukończyć • ← → nawigacja
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={cn(
            'p-3 rounded-full transition-all',
            currentIndex === 0
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          )}
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        
        {/* Dots indicator */}
        <div className="flex gap-2">
          {tasks.slice(Math.max(0, currentIndex - 2), Math.min(tasks.length, currentIndex + 3)).map((task, i) => {
            const actualIndex = Math.max(0, currentIndex - 2) + i
            return (
              <button
                key={task.id}
                onClick={() => setCurrentIndex(actualIndex)}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  actualIndex === currentIndex
                    ? 'w-8 bg-violet-600'
                    : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                )}
              />
            )
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === tasks.length - 1}
          className={cn(
            'p-3 rounded-full transition-all',
            currentIndex === tasks.length - 1
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          )}
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Task list sidebar */}
      <AnimatePresence>
        {showTaskList && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTaskList(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Lista zadań ({tasks.length})
                </h2>
                <button
                  onClick={() => setShowTaskList(false)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-3 space-y-2">
                {tasks.map((task, index) => {
                  const colors = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
                  return (
                    <button
                      key={task.id}
                      onClick={() => selectTask(index)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-all',
                        index === currentIndex
                          ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500'
                          : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn(
                          'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                          colors.bg.replace('-100', '-500')
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {task.title}
                          </p>
                          {task.category && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {task.category.icon} {task.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
