'use client'

import { useState, useMemo } from 'react'
import { Task, Category } from '@prisma/client'
import { format, isToday, isTomorrow, isPast, startOfDay, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { PRIORITY_COLORS, STATUS_COLORS } from '@/lib/utils/constants'
import {
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { updateTaskStatus } from '@/lib/actions/tasks'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

type TaskWithCategory = Task & { category: Category | null }

interface TimelineClientProps {
  tasks: TaskWithCategory[]
  overdueTasks: TaskWithCategory[]
}

export function TimelineClient({ tasks, overdueTasks }: TimelineClientProps) {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const [viewDays, setViewDays] = useState(7)
  const [startDate, setStartDate] = useState(startOfDay(new Date()))

  // Generate days for the timeline
  const days = useMemo(() => {
    return Array.from({ length: viewDays }, (_, i) => addDays(startDate, i))
  }, [startDate, viewDays])

  // Group tasks by day
  const tasksByDay = useMemo(() => {
    const grouped: Record<string, TaskWithCategory[]> = {}
    
    days.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd')
      grouped[dayKey] = tasks.filter(task => {
        if (!task.dueDate) return false
        return format(new Date(task.dueDate), 'yyyy-MM-dd') === dayKey
      })
    })

    return grouped
  }, [days, tasks])

  const handleComplete = async (taskId: string) => {
    const result = await updateTaskStatus(taskId, 'COMPLETED')
    if (result.success) {
      showSuccess('Zadanie ukończone', 'Brawo! 🎉')
      router.refresh()
    } else {
      showError('Błąd', result.error || 'Nie udało się ukończyć zadania')
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setStartDate(prev => addDays(prev, direction === 'next' ? viewDays : -viewDays))
  }

  const goToToday = () => {
    setStartDate(startOfDay(new Date()))
  }

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return 'Dziś'
    if (isTomorrow(date)) return 'Jutro'
    return format(date, 'EEEE', { locale: pl })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Timeline</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Przeglądaj zadania na osi czasu
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View options */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setViewDays(days)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  viewDays === days
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {days}d
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            >
              Dziś
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Overdue tasks alert */}
      {overdueTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-300">
                Zaległe zadania ({overdueTasks.length})
              </h3>
              <div className="mt-2 space-y-2">
                {overdueTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-red-700 dark:text-red-400">{task.title}</span>
                    <span className="text-red-500 dark:text-red-500 text-xs">
                      {format(new Date(task.dueDate!), 'dd.MM', { locale: pl })}
                    </span>
                  </div>
                ))}
                {overdueTasks.length > 3 && (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    +{overdueTasks.length - 3} więcej...
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <AnimatePresence mode="popLayout">
          {days.map((day, index) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayTasks = tasksByDay[dayKey] || []
            const isCurrentDay = isToday(day)

            return (
              <motion.div
                key={dayKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'bg-white dark:bg-slate-800 rounded-xl border-2 overflow-hidden',
                  isCurrentDay
                    ? 'border-violet-500 shadow-lg shadow-violet-500/10'
                    : 'border-slate-200 dark:border-slate-700'
                )}
              >
                {/* Day header */}
                <div
                  className={cn(
                    'px-4 py-3 border-b',
                    isCurrentDay
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  )}
                >
                  <div className="text-sm font-semibold capitalize">
                    {getDayLabel(day)}
                  </div>
                  <div className={cn(
                    'text-xs',
                    isCurrentDay ? 'text-violet-200' : 'text-slate-500 dark:text-slate-400'
                  )}>
                    {format(day, 'd MMMM', { locale: pl })}
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-3 space-y-2 min-h-[120px]">
                  {dayTasks.length > 0 ? (
                    dayTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          'p-2 rounded-lg border-l-4 bg-slate-50 dark:bg-slate-700/50',
                          'hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
                          'group cursor-pointer',
                          task.status === 'COMPLETED' && 'opacity-60',
                          task.category?.color
                            ? `border-[${task.category.color}]`
                            : 'border-slate-300 dark:border-slate-600'
                        )}
                        style={{ borderLeftColor: task.category?.color || '#94a3b8' }}
                      >
                        <div className="flex items-start gap-2">
                          {/* Complete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleComplete(task.id)
                            }}
                            className={cn(
                              'mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all',
                              task.status === 'COMPLETED'
                                ? 'bg-green-500 border-green-500'
                                : 'border-slate-300 dark:border-slate-500 hover:border-green-500'
                            )}
                          >
                            {task.status === 'COMPLETED' && (
                              <CheckCircleIcon className="w-3 h-3 text-white" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm font-medium truncate',
                              task.status === 'COMPLETED'
                                ? 'text-slate-400 dark:text-slate-500 line-through'
                                : 'text-slate-900 dark:text-white'
                            )}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {task.dueDate && (
                                <span className="flex items-center gap-0.5 text-xs text-slate-500 dark:text-slate-400">
                                  <ClockIcon className="w-3 h-3" />
                                  {format(new Date(task.dueDate), 'HH:mm')}
                                </span>
                              )}
                              <span
                                className={cn(
                                  'text-xs font-medium px-1.5 py-0.5 rounded',
                                  PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]?.bg || 'bg-slate-100',
                                  PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]?.text || 'text-slate-600'
                                )}
                              >
                                P{task.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-20 text-slate-400 dark:text-slate-500">
                      <CalendarIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs">Brak zadań</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {tasks.length}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Zaplanowane
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Ukończone
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {overdueTasks.length}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Zaległe
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-violet-600">
              {tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Minut łącznie
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
