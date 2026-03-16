'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface WeeklyProductivityScoreProps {
  completed: number
  total: number
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  animate?: boolean
}

export function WeeklyProductivityScore({
  completed,
  total,
  size = 'md',
  showDetails = true,
  animate = true,
}: WeeklyProductivityScoreProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  const sizeClasses = {
    sm: {
      container: 'w-24 h-24',
      text: 'text-xl',
      label: 'text-xs',
      strokeWidth: 6,
    },
    md: {
      container: 'w-32 h-32',
      text: 'text-3xl',
      label: 'text-sm',
      strokeWidth: 8,
    },
    lg: {
      container: 'w-40 h-40',
      text: 'text-4xl',
      label: 'text-base',
      strokeWidth: 10,
    },
  }

  const classes = sizeClasses[size]

  // Get color based on percentage
  const getColor = () => {
    if (percentage >= 80) return { stroke: '#22c55e', bg: 'bg-green-50 dark:bg-green-900/20' }
    if (percentage >= 60) return { stroke: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20' }
    if (percentage >= 40) return { stroke: '#f59e0b', bg: 'bg-yellow-50 dark:bg-yellow-900/20' }
    return { stroke: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20' }
  }

  const color = getColor()

  // Get motivational message
  const getMessage = () => {
    if (percentage >= 90) return '🏆 Perfekcyjnie!'
    if (percentage >= 80) return '🔥 Świetna robota!'
    if (percentage >= 60) return '💪 Dobrze idzie!'
    if (percentage >= 40) return '📈 Możesz więcej!'
    if (percentage > 0) return '🚀 Do dzieła!'
    return '✨ Zacznij tydzień!'
  }

  // SVG circle properties
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center', showDetails && 'gap-4')}>
      {/* Circular progress */}
      <div className={cn('relative', classes.container)}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={classes.strokeWidth}
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={classes.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={animate ? { scale: 0 } : { scale: 1 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={cn('font-bold text-slate-900 dark:text-white', classes.text)}
          >
            {percentage}%
          </motion.span>
          <span className={cn('text-slate-500 dark:text-slate-400', classes.label)}>
            ten tydzień
          </span>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <motion.div
          initial={animate ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={cn('rounded-xl p-4 w-full', color.bg)}
        >
          <p className="text-center font-medium text-slate-700 dark:text-slate-300 mb-3">
            {getMessage()}
          </p>
          
          <div className="flex justify-around text-sm">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <CheckCircleIcon className="w-4 h-4" />
              <span>{completed} ukończone</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <ClockIcon className="w-4 h-4" />
              <span>{total - completed} pozostało</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Mini version for dashboard cards
interface MiniProductivityScoreProps {
  percentage: number
}

export function MiniProductivityScore({ percentage }: MiniProductivityScoreProps) {
  const getColor = () => {
    if (percentage >= 80) return 'text-green-500'
    if (percentage >= 60) return 'text-blue-500'
    if (percentage >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getBgColor = () => {
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30'
    if (percentage >= 60) return 'bg-blue-100 dark:bg-blue-900/30'
    if (percentage >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full', getBgColor())}>
      <div className="relative w-8 h-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="50%"
            cy="50%"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={75.4}
            strokeDashoffset={75.4 - (percentage / 100) * 75.4}
            className={getColor()}
          />
        </svg>
      </div>
      <span className={cn('font-semibold text-sm', getColor())}>
        {percentage}%
      </span>
    </div>
  )
}
