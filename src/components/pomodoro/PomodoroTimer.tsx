'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  Cog6ToothIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { startPomodoro, completePomodoro, cancelPomodoro, getActivePomodoro } from '@/lib/actions/pomodoro'
import confetti from 'canvas-confetti'

type PomodoroType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'

interface PomodoroTimerProps {
  taskId?: string | null
  taskTitle?: string
  onComplete?: () => void
  compact?: boolean
}

const TIMER_PRESETS = {
  WORK: { duration: 25, label: 'Praca', color: 'from-red-500 to-orange-500' },
  SHORT_BREAK: { duration: 5, label: 'Krótka przerwa', color: 'from-green-500 to-teal-500' },
  LONG_BREAK: { duration: 15, label: 'Długa przerwa', color: 'from-blue-500 to-indigo-500' },
}

export function PomodoroTimer({ taskId, taskTitle, onComplete, compact = false }: PomodoroTimerProps) {
  const [type, setType] = useState<PomodoroType>('WORK')
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.WORK.duration * 60)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [customDuration, setCustomDuration] = useState(25)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleComplete = useCallback(async () => {
    // Play sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }

    if (sessionId && type === 'WORK') {
      await completePomodoro(sessionId)
      setCompletedPomodoros((prev) => prev + 1)
      
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      onComplete?.()
    }

    // Auto-switch to break or work
    if (type === 'WORK') {
      const nextType = completedPomodoros > 0 && (completedPomodoros + 1) % 4 === 0
        ? 'LONG_BREAK'
        : 'SHORT_BREAK'
      setType(nextType)
      setTimeLeft(TIMER_PRESETS[nextType].duration * 60)
    } else {
      setType('WORK')
      setTimeLeft(customDuration * 60)
    }

    setIsRunning(false)
    setIsPaused(false)
    setSessionId(null)
  }, [completedPomodoros, customDuration, onComplete, sessionId, type])

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/bell.mp3')
    audioRef.current.volume = 0.5
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Check for active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      const active = await getActivePomodoro()
      if (active && !active.endedAt) {
        setSessionId(active.id)
        setType(active.type as PomodoroType)
        setIsRunning(true)
        
        // Calculate remaining time
        const elapsed = Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000)
        const remaining = active.duration * 60 - elapsed
        if (remaining > 0) {
          setTimeLeft(remaining)
        } else {
          // Session should have ended
          await handleComplete()
        }
      }
    }
    void checkActiveSession()
  }, [handleComplete])

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            void handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [handleComplete, isRunning, isPaused, timeLeft])

  const handleStart = async () => {
    const duration = type === 'WORK' ? customDuration : TIMER_PRESETS[type].duration
    
    const result = await startPomodoro({
      taskId: taskId || null,
      duration,
      type,
    })

    if (result.success && result.data) {
      setSessionId(result.data.id)
      setTimeLeft(duration * 60)
      setIsRunning(true)
      setIsPaused(false)
    }
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleStop = async () => {
    if (sessionId) {
      await cancelPomodoro(sessionId)
    }
    resetTimer()
  }

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setSessionId(null)
    setTimeLeft(TIMER_PRESETS[type].duration * 60)
  }, [type])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = type === 'WORK'
    ? ((customDuration * 60 - timeLeft) / (customDuration * 60)) * 100
    : ((TIMER_PRESETS[type].duration * 60 - timeLeft) / (TIMER_PRESETS[type].duration * 60)) * 100

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${TIMER_PRESETS[type].color} flex items-center justify-center`}>
          <span className="text-xs font-bold text-white">🍅</span>
        </div>
        <span className="font-mono text-lg font-semibold dark:text-white">
          {formatTime(timeLeft)}
        </span>
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <PlayIcon className="w-5 h-5 text-green-600" />
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {isPaused ? (
                <PlayIcon className="w-5 h-5 text-green-600" />
              ) : (
                <PauseIcon className="w-5 h-5 text-yellow-600" />
              )}
            </button>
            <button
              onClick={handleStop}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <StopIcon className="w-5 h-5 text-red-600" />
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      {/* Type selector */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(TIMER_PRESETS) as PomodoroType[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              if (!isRunning) {
                setType(t)
                setTimeLeft(t === 'WORK' ? customDuration * 60 : TIMER_PRESETS[t].duration * 60)
              }
            }}
            disabled={isRunning}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              type === t
                ? `bg-gradient-to-r ${TIMER_PRESETS[t].color} text-white shadow-md`
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {TIMER_PRESETS[t].label}
          </button>
        ))}
      </div>

      {/* Task title */}
      {taskTitle && (
        <div className="text-center mb-4">
          <span className="text-sm text-slate-500 dark:text-slate-400">Zadanie:</span>
          <p className="font-medium text-slate-700 dark:text-white truncate">{taskTitle}</p>
        </div>
      )}

      {/* Timer display */}
      <div className="relative mb-6">
        <svg className="w-48 h-48 mx-auto transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={553}
            initial={{ strokeDashoffset: 553 }}
            animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={type === 'WORK' ? '#ef4444' : type === 'SHORT_BREAK' ? '#22c55e' : '#3b82f6'} />
              <stop offset="100%" stopColor={type === 'WORK' ? '#f97316' : type === 'SHORT_BREAK' ? '#14b8a6' : '#6366f1'} />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="font-mono text-5xl font-bold text-slate-800 dark:text-white"
            key={timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {TIMER_PRESETS[type].label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <>
            <button
              onClick={handleStart}
              className={`p-4 rounded-full bg-gradient-to-r ${TIMER_PRESETS[type].color} text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}
            >
              <PlayIcon className="w-8 h-8" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              <Cog6ToothIcon className="w-8 h-8" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handlePause}
              className={`p-4 rounded-full ${isPaused ? 'bg-green-500' : 'bg-yellow-500'} text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}
            >
              {isPaused ? <PlayIcon className="w-8 h-8" /> : <PauseIcon className="w-8 h-8" />}
            </button>
            <button
              onClick={handleStop}
              className="p-4 rounded-full bg-red-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <StopIcon className="w-8 h-8" />
            </button>
            <button
              onClick={handleComplete}
              className="p-4 rounded-full bg-green-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              title="Zakończ wcześniej"
            >
              <CheckIcon className="w-8 h-8" />
            </button>
          </>
        )}
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && !isRunning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
          >
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Czas pracy (minuty)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="60"
                value={customDuration}
                onChange={(e) => {
                  setCustomDuration(Number(e.target.value))
                  if (type === 'WORK') {
                    setTimeLeft(Number(e.target.value) * 60)
                  }
                }}
                className="flex-1 accent-violet-600"
              />
              <span className="w-12 text-center font-mono font-bold text-slate-700 dark:text-white">
                {customDuration}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-center gap-6 text-center">
          <div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">
              {completedPomodoros}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Dziś ukończone</p>
          </div>
          <div>
            <span className="text-2xl">🍅</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {4 - (completedPomodoros % 4)} do przerwy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
