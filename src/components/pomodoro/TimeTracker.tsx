'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  StopIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  startTimeEntry, 
  stopTimeEntry, 
  getActiveTimeEntry,
  type TimeEntry 
} from '@/lib/actions/timeTracking'

interface TimeTrackerProps {
  taskId: string
  taskTitle: string
  onUpdate?: () => void
  compact?: boolean
}

export function TimeTracker({ taskId, taskTitle, onUpdate, compact = false }: TimeTrackerProps) {
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Check for active entry on mount
  useEffect(() => {
    const checkActiveEntry = async () => {
      const entry = await getActiveTimeEntry()
      if (entry && entry.taskId === taskId) {
        setActiveEntry(entry)
      }
    }
    checkActiveEntry()
  }, [taskId])

  // Update elapsed time
  useEffect(() => {
    if (activeEntry && !activeEntry.endedAt) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(activeEntry.startedAt).getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [activeEntry])

  const handleStart = async () => {
    setIsLoading(true)
    const result = await startTimeEntry({ taskId })
    
    if (result.success && result.data) {
      setActiveEntry(result.data)
      setElapsedTime(0)
      onUpdate?.()
    }
    setIsLoading(false)
  }

  const handleStop = async () => {
    if (!activeEntry) return
    
    setIsLoading(true)
    const result = await stopTimeEntry(activeEntry.id)
    
    if (result.success) {
      setActiveEntry(null)
      setElapsedTime(0)
      onUpdate?.()
    }
    setIsLoading(false)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isTracking = activeEntry && activeEntry.taskId === taskId

  if (compact) {
    return (
      <button
        onClick={isTracking ? handleStop : handleStart}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-all ${
          isTracking
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
        }`}
      >
        {isTracking ? (
          <>
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            <span className="font-mono text-xs">{formatTime(elapsedTime)}</span>
            <StopIcon className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <ClockIcon className="w-3.5 h-3.5" />
            <span className="text-xs">Śledź</span>
          </>
        )}
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isTracking ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
            <ClockIcon className={`w-5 h-5 ${isTracking ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-white">
              {isTracking ? 'Śledzenie czasu' : 'Śledzenie czasu'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
              {taskTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isTracking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
              <span className="font-mono text-lg font-semibold text-slate-800 dark:text-white">
                {formatTime(elapsedTime)}
              </span>
            </motion.div>
          )}
          
          <button
            onClick={isTracking ? handleStop : handleStart}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all ${
              isTracking
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isTracking ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
