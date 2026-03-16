'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  CheckCircleIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { generateStarterContent, completeOnboarding } from '@/lib/actions/onboarding'
import { Button } from '@/components/ui'
import confetti from 'canvas-confetti'

interface GuidedTourProps {
  userGoal: string | null
  onComplete: () => void
}

const STEPS = [
  {
    id: 'intro',
    title: 'Przygotowujemy Twój workspace',
    description: 'Na podstawie Twojego celu stworzymy dla Ciebie spersonalizowane kategorie i przykładowe zadania.',
    icon: SparklesIcon,
  },
  {
    id: 'categories',
    title: 'Tworzymy kategorie',
    description: 'Kategorie pomogą Ci organizować zadania i łatwo je filtrować.',
    icon: FolderIcon,
  },
  {
    id: 'tasks',
    title: 'Dodajemy pierwsze zadania',
    description: 'Przykładowe zadania pokażą Ci jak efektywnie korzystać z TimeWizard.',
    icon: ClipboardDocumentListIcon,
  },
  {
    id: 'schedule',
    title: 'Tworzymy harmonogram',
    description: 'Zadania zostały zaplanowane na najbliższe dni.',
    icon: CalendarIcon,
  },
  {
    id: 'ready',
    title: 'Gotowe! 🎉',
    description: 'Twój workspace jest przygotowany. Czas na produktywność!',
    icon: RocketLaunchIcon,
  },
]

const GOAL_NAMES: Record<string, string> = {
  WORK: 'Praca',
  STUDIES: 'Studia',
  PROJECTS: 'Projekty',
  PERSONAL: 'Życie prywatne',
}

export function GuidedTour({ userGoal, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<{ categoriesCount: number; tasksCount: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const triggerConfetti = useCallback(() => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }, [])

  const startGeneration = useCallback(async () => {
    setIsGenerating(true)
    setCurrentStep(1) // Categories
    
    // Symulacja postępu
    await new Promise(r => setTimeout(r, 1200))
    setCurrentStep(2) // Tasks
    
    // Faktyczne generowanie
    const result = await generateStarterContent()
    
    await new Promise(r => setTimeout(r, 800))
    setCurrentStep(3) // Schedule
    
    if (result.success && result.data) {
      setGeneratedData(result.data)
      await new Promise(r => setTimeout(r, 1000))
      setCurrentStep(4) // Ready
      
      // Confetti effect!
      triggerConfetti()
    } else {
      setError(result.error || 'Coś poszło nie tak')
    }
    
    setIsGenerating(false)
  }, [triggerConfetti])

  // Automatyczna progresja kroków
  useEffect(() => {
    if (currentStep === 0) {
      // Start po 1.5s
      const timer = setTimeout(() => {
        void startGeneration()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentStep, startGeneration])

  const handleFinish = async () => {
    await completeOnboarding()
    onComplete()
  }

  const step = STEPS[currentStep]
  const StepIcon = step.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 p-4"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500',
                  i < currentStep
                    ? 'bg-green-500 text-white'
                    : i === currentStep
                    ? 'bg-violet-500 text-white ring-4 ring-violet-500/30'
                    : 'bg-white/10 text-white/30'
                )}
              >
                {i < currentStep ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{i + 1}</span>
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={cn(
                'inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6',
                currentStep === 4
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-violet-500 to-purple-600'
              )}
            >
              <StepIcon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-3">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-slate-300 mb-6">
              {step.description}
            </p>

            {/* Goal badge */}
            {userGoal && currentStep < 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm text-white/70 mb-6"
              >
                <SparklesIcon className="w-4 h-4" />
                Cel: {GOAL_NAMES[userGoal] || userGoal}
              </motion.div>
            )}

            {/* Generated stats */}
            {currentStep === 4 && generatedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-6 mb-8"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-1">
                    {generatedData.categoriesCount}
                  </div>
                  <div className="text-sm text-slate-400">Kategorie</div>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-1">
                    {generatedData.tasksCount}
                  </div>
                  <div className="text-sm text-slate-400">Zadania</div>
                </div>
              </motion.div>
            )}

            {/* Loading animation */}
            {isGenerating && currentStep < 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center gap-1 mb-6"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-violet-400"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 text-red-300"
              >
                {error}
              </motion.div>
            )}

            {/* Action button */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={handleFinish}
                  className="px-10 py-4 text-lg font-semibold rounded-xl shadow-xl shadow-violet-500/25 gap-2"
                >
                  Przejdź do dashboardu
                  <ArrowRightIcon className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
