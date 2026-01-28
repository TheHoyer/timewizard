'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BriefcaseIcon, 
  AcademicCapIcon, 
  RocketLaunchIcon,
  HeartIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { setUserGoal, type UserGoal } from '@/lib/actions/onboarding'
import { Button } from '@/components/ui'

interface WelcomeScreenProps {
  userName?: string | null
  onComplete: () => void
}

const GOALS = [
  {
    id: 'WORK' as UserGoal,
    title: 'Praca',
    description: 'Zarządzaj projektami, spotkaniami i deadlinami',
    icon: BriefcaseIcon,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'STUDIES' as UserGoal,
    title: 'Studia',
    description: 'Organizuj naukę, projekty i przygotowania do egzaminów',
    icon: AcademicCapIcon,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'PROJECTS' as UserGoal,
    title: 'Projekty',
    description: 'Planuj i realizuj swoje projekty krok po kroku',
    icon: RocketLaunchIcon,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'PERSONAL' as UserGoal,
    title: 'Życie prywatne',
    description: 'Buduj nawyki, dbaj o zdrowie i rozwój osobisty',
    icon: HeartIcon,
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
]

// Pre-generate particle positions to avoid Math.random() during render
const generateParticleData = () => {
  return [...Array(20)].map((_, i) => ({
    id: i,
    initialX: Math.random() * 1000,
    initialY: Math.random() * 800,
    targetY: Math.random() * -200 - 100,
    duration: 3 + Math.random() * 3,
    delay: Math.random() * 2,
  }))
}

const PARTICLE_DATA = generateParticleData()

export function WelcomeScreen({ userName, onComplete }: WelcomeScreenProps) {
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleContinue = async () => {
    if (!selectedGoal) return

    setIsSubmitting(true)
    const result = await setUserGoal(selectedGoal)
    
    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 1500)
    }
    setIsSubmitting(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 p-4 overflow-y-auto"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLE_DATA.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
            }}
            animate={{
              y: [null, particle.targetY],
              opacity: [0.2, 0.8, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              repeatType: 'loop',
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <CheckCircleIcon className="w-24 h-24 text-green-400 mx-auto" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-3xl font-bold text-white"
            >
              Świetny wybór!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-lg text-slate-300"
            >
              Przygotowujemy Twój workspace...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/25 mb-6"
              >
                <SparklesIcon className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Witaj{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto"
              >
                TimeWizard pomoże Ci być bardziej produktywnym. 
                <br className="hidden md:block" />
                Na początek, powiedz nam jaki jest Twój główny cel.
              </motion.p>
            </div>

            {/* Goal selection grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
            >
              {GOALS.map((goal, index) => {
                const Icon = goal.icon
                const isSelected = selectedGoal === goal.id

                return (
                  <motion.button
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={cn(
                      'relative p-6 rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden',
                      'backdrop-blur-sm',
                      isSelected
                        ? `border-white/60 bg-gradient-to-br ${goal.color}`
                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                    )}
                  >
                    {/* Selected glow effect */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-white/10"
                      />
                    )}
                    
                    <div className="relative z-10 flex items-start gap-4">
                      <div className={cn(
                        'p-3 rounded-xl transition-colors',
                        isSelected ? 'bg-white/30' : 'bg-white/10'
                      )}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {goal.title}
                        </h3>
                        <p className={cn(
                          'text-sm',
                          isSelected ? 'text-white/90' : 'text-slate-300'
                        )}>
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Selected indicator - bottom right corner */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selectedGoal || isSubmitting}
                isLoading={isSubmitting}
                className={cn(
                  'px-12 py-4 text-lg font-semibold rounded-xl',
                  'shadow-xl shadow-violet-500/25',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? 'Przygotowujemy...' : 'Kontynuuj'}
              </Button>
            </motion.div>

            {/* Skip option */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-6 text-slate-400 text-sm"
            >
              Możesz też{' '}
              <button
                onClick={onComplete}
                className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
              >
                pominąć wprowadzenie
              </button>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
