'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  PlusIcon,
  CheckCircleIcon,
  EyeIcon,
  TrophyIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline'
import { markTooltipShown } from '@/lib/actions/onboarding'
import confetti from 'canvas-confetti'

interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  icon: React.ComponentType<{ className?: string }>
  requiresClick: boolean
  clickText?: string
  route?: string
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Witaj w TimeWizard! 🎉',
    description: 'Przeprowadzimy Cię przez najważniejsze funkcje aplikacji krok po kroku. Wykonuj instrukcje, a szybko poznasz wszystkie możliwości!',
    position: 'center',
    icon: SparklesIcon,
    requiresClick: false,
    route: '/dashboard',
  },
  {
    id: 'add-task',
    title: '1. Dodaj nowe zadanie',
    description: 'Kliknij podświetlony przycisk "Nowe zadanie" aby otworzyć formularz dodawania. To podstawowa funkcja aplikacji!',
    targetSelector: '[data-tutorial="add-task"]',
    position: 'bottom',
    icon: PlusIcon,
    requiresClick: true,
    clickText: '👆 Kliknij podświetlony przycisk',
    route: '/dashboard',
  },
  {
    id: 'task-list',
    title: '2. Twoje zadania',
    description: 'Tutaj widzisz listę wszystkich zadań. Kliknij checkbox przy zadaniu aby je ukończyć i zdobyć punkty XP!',
    targetSelector: '[data-tutorial="task-list"]',
    position: 'left',
    icon: CheckCircleIcon,
    requiresClick: false,
    route: '/dashboard',
  },
  {
    id: 'focus-mode',
    title: '3. Tryb Focus',
    description: 'Kliknij "Tryb Skupienia" w menu bocznym, aby przejść do trybu Pomodoro.',
    targetSelector: 'a[href="/focus"]',
    position: 'right',
    icon: EyeIcon,
    requiresClick: true,
    clickText: '👆 Kliknij w menu po lewej',
    route: '/dashboard',
  },
  {
    id: 'focus-explain',
    title: '4. Timer Pomodoro',
    description: 'To jest tryb Focus! Możesz tutaj uruchomić timer 25-minutowy do skupionej pracy. Technika Pomodoro znacząco zwiększa produktywność!',
    position: 'center',
    icon: EyeIcon,
    requiresClick: false,
    route: '/focus',
  },
  {
    id: 'achievements',
    title: '5. Osiągnięcia',
    description: 'Kliknij "Osiągnięcia" w menu bocznym, aby zobaczyć swoje odznaki i postępy.',
    targetSelector: 'a[href="/achievements"]',
    position: 'right',
    icon: TrophyIcon,
    requiresClick: true,
    clickText: '👆 Kliknij w menu po lewej',
    route: '/focus',
  },
  {
    id: 'achievements-explain',
    title: '6. Twoje osiągnięcia',
    description: 'Tutaj widzisz wszystkie dostępne osiągnięcia. Wykonuj zadania, utrzymuj streak i zdobywaj odznaki!',
    position: 'center',
    icon: TrophyIcon,
    requiresClick: false,
    route: '/achievements',
  },
  {
    id: 'complete',
    title: 'Gratulacje! 🚀',
    description: 'Znasz już podstawy TimeWizard! Wróć do dashboardu i zacznij od ukończenia pierwszego zadania. Powodzenia!',
    position: 'center',
    icon: CheckIcon,
    requiresClick: false,
    route: '/achievements',
  },
]

interface InteractiveTutorialProps {
  onComplete: () => void
  onSkip?: () => void
}

export function InteractiveTutorial({ onComplete }: InteractiveTutorialProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isWaitingForClick, setIsWaitingForClick] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const clickHandlerRef = useRef<((e: MouseEvent) => void) | null>(null)

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1
  const Icon = step.icon

  
  const goToNextStep = useCallback(() => {
    if (isLastStep) {
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        zIndex: 99999,
      })
      
      
      document.querySelectorAll('.tutorial-target-highlight').forEach(el => {
        el.classList.remove('tutorial-target-highlight')
      })
      
      markTooltipShown('interactive-tutorial')
      
      
      router.push('/dashboard')
      
      setTimeout(() => {
        onComplete()
      }, 500)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }, [isLastStep, onComplete, router])

  
  useEffect(() => {
    if (step.route && pathname !== step.route) {
      
      const timeout = setTimeout(() => {
        setIsNavigating(true)
        router.push(step.route!)
        setTimeout(() => setIsNavigating(false), 500)
      }, 0)
      return () => clearTimeout(timeout)
    }
  }, [currentStep, step.route, pathname, router])

  
  useEffect(() => {
    if (isNavigating) return

    const findAndHighlightElement = () => {
      
      document.querySelectorAll('.tutorial-target-highlight').forEach(el => {
        el.classList.remove('tutorial-target-highlight')
      })

      if (step.targetSelector) {
        const element = document.querySelector(step.targetSelector) as HTMLElement
        if (element) {
          const rect = element.getBoundingClientRect()
          setTargetRect(rect)
          element.classList.add('tutorial-target-highlight')
          
          
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }

          
          if (step.requiresClick) {
            setIsWaitingForClick(true)
            
            
            if (clickHandlerRef.current) {
              document.removeEventListener('click', clickHandlerRef.current, true)
            }

            
            const handleClick = (e: MouseEvent) => {
              const target = e.target as HTMLElement
              if (element.contains(target) || element === target) {
                setIsWaitingForClick(false)
                element.classList.remove('tutorial-target-highlight')
                
                
                if (step.id === 'add-task') {
                  setTimeout(() => {
                    
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
                    
                    const backdrop = document.querySelector('[data-dialog-backdrop]') as HTMLElement
                    if (backdrop) backdrop.click()
                  }, 300)
                }
                
                
                setTimeout(() => {
                  goToNextStep()
                }, step.id === 'add-task' ? 800 : 400)
                
                document.removeEventListener('click', handleClick, true)
                clickHandlerRef.current = null
              }
            }

            clickHandlerRef.current = handleClick
            document.addEventListener('click', handleClick, true)
          } else {
            setIsWaitingForClick(false)
          }
        } else {
          setTargetRect(null)
          setIsWaitingForClick(false)
        }
      } else {
        setTargetRect(null)
        setIsWaitingForClick(false)
      }
    }

    
    let attempts = 0
    const maxAttempts = 5
    
    const tryFindElement = () => {
      attempts++
      const element = step.targetSelector ? document.querySelector(step.targetSelector) : null
      
      
      console.log(`[Tutorial] Step: ${step.id}, Selector: ${step.targetSelector}, Found: ${!!element}, Attempt: ${attempts}`)
      
      if (element || !step.targetSelector || attempts >= maxAttempts) {
        findAndHighlightElement()
      } else {
        
        setTimeout(tryFindElement, 300)
      }
    }
    
    const timer = setTimeout(tryFindElement, 400)
    
    return () => {
      clearTimeout(timer)
      if (clickHandlerRef.current) {
        document.removeEventListener('click', clickHandlerRef.current, true)
      }
    }
  }, [currentStep, step.targetSelector, step.requiresClick, step.id, pathname, isNavigating, goToNextStep])

  
  useEffect(() => {
    const updatePosition = () => {
      if (step.targetSelector) {
        const element = document.querySelector(step.targetSelector)
        if (element) {
          setTargetRect(element.getBoundingClientRect())
        }
      }
    }

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [step.targetSelector])

  
  const getTooltipStyle = (): React.CSSProperties => {
    const tooltipWidth = 380 
    const tooltipHeight = 250 
    const padding = 16 
    const edgePadding = 16 
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800

    
    if (!targetRect || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: `${Math.min(tooltipWidth, viewportWidth - edgePadding * 2)}px`,
      }
    }

    const style: React.CSSProperties = { 
      position: 'fixed',
      maxWidth: `${Math.min(tooltipWidth, viewportWidth - edgePadding * 2)}px`,
    }

    
    const spaceAbove = targetRect.top
    const spaceBelow = viewportHeight - targetRect.bottom
    const spaceLeft = targetRect.left
    const spaceRight = viewportWidth - targetRect.right

    
    let finalPosition = step.position

    
    if (finalPosition === 'bottom' && spaceBelow < tooltipHeight + padding) {
      finalPosition = spaceAbove > spaceBelow ? 'top' : 'bottom'
    }
    if (finalPosition === 'top' && spaceAbove < tooltipHeight + padding) {
      finalPosition = spaceBelow > spaceAbove ? 'bottom' : 'top'
    }
    if (finalPosition === 'right' && spaceRight < tooltipWidth + padding) {
      finalPosition = spaceLeft > spaceRight ? 'left' : 'right'
    }
    if (finalPosition === 'left' && spaceLeft < tooltipWidth + padding) {
      finalPosition = spaceRight > spaceLeft ? 'right' : 'left'
    }

    
    const calculateHorizontalPosition = () => {
      const centerX = targetRect.left + targetRect.width / 2
      const halfTooltip = tooltipWidth / 2
      
      
      if (centerX - halfTooltip < edgePadding) {
        
        return { left: `${edgePadding}px`, transform: 'none' }
      } else if (centerX + halfTooltip > viewportWidth - edgePadding) {
        
        return { right: `${edgePadding}px`, transform: 'none' }
      } else {
        
        return { left: `${centerX}px`, transform: 'translateX(-50%)' }
      }
    }

    
    const calculateVerticalPosition = () => {
      const centerY = targetRect.top + targetRect.height / 2
      const halfTooltip = tooltipHeight / 2
      
      if (centerY - halfTooltip < edgePadding) {
        return { top: `${edgePadding}px`, transform: 'none' }
      } else if (centerY + halfTooltip > viewportHeight - edgePadding) {
        return { bottom: `${edgePadding}px`, transform: 'none' }
      } else {
        return { top: `${centerY}px`, transform: 'translateY(-50%)' }
      }
    }

    switch (finalPosition) {
      case 'top': {
        const horizontal = calculateHorizontalPosition()
        style.bottom = `${viewportHeight - targetRect.top + padding}px`
        style.left = horizontal.left
        style.right = horizontal.right
        style.transform = horizontal.transform
        break
      }
      case 'bottom': {
        const horizontal = calculateHorizontalPosition()
        const topPos = targetRect.bottom + padding
        
        style.top = `${Math.min(topPos, viewportHeight - tooltipHeight - edgePadding)}px`
        style.left = horizontal.left
        style.right = horizontal.right
        style.transform = horizontal.transform
        break
      }
      case 'left': {
        const vertical = calculateVerticalPosition()
        const rightPos = viewportWidth - targetRect.left + padding
        style.right = `${Math.min(rightPos, viewportWidth - edgePadding - 100)}px`
        style.top = vertical.top
        style.bottom = vertical.bottom
        style.transform = vertical.transform
        break
      }
      case 'right': {
        const vertical = calculateVerticalPosition()
        
        const leftPos = Math.max(targetRect.right + padding + 20, 280)
        
        style.left = `${Math.min(leftPos, viewportWidth - tooltipWidth - edgePadding)}px`
        style.top = vertical.top
        style.bottom = vertical.bottom
        style.transform = vertical.transform
        break
      }
    }

    return style
  }

  if (isNavigating) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl font-medium flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
          />
          Przechodzę do następnej strony...
        </motion.div>
      </div>
    )
  }

  return (
    <>
      
      <style jsx global>{`
        .tutorial-target-highlight {
          position: relative;
          z-index: 10000 !important;
          pointer-events: auto !important;
          cursor: pointer !important;
          animation: tutorial-pulse 1.5s ease-in-out infinite;
          box-shadow: 
            0 0 0 4px rgba(139, 92, 246, 0.8),
            0 0 0 8px rgba(139, 92, 246, 0.4),
            0 0 40px rgba(139, 92, 246, 0.6) !important;
          border-radius: 12px;
        }
        
        .tutorial-target-highlight * {
          pointer-events: auto !important;
        }
        
        @keyframes tutorial-pulse {
          0%, 100% {
            box-shadow: 
              0 0 0 4px rgba(139, 92, 246, 0.8),
              0 0 0 8px rgba(139, 92, 246, 0.4),
              0 0 40px rgba(139, 92, 246, 0.6);
          }
          50% {
            box-shadow: 
              0 0 0 6px rgba(139, 92, 246, 1),
              0 0 0 12px rgba(139, 92, 246, 0.5),
              0 0 60px rgba(139, 92, 246, 0.8);
          }
        }
      `}</style>

      
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        
        {targetRect && (
          <>
            <div 
              className="absolute bg-black/70 pointer-events-none"
              style={{ top: 0, left: 0, right: 0, height: Math.max(0, targetRect.top - 8) }}
            />
            
            <div 
              className="absolute bg-black/70 pointer-events-none"
              style={{ 
                top: targetRect.top - 8, 
                left: 0, 
                width: Math.max(0, targetRect.left - 8),
                height: targetRect.height + 16
              }}
            />
            
            <div 
              className="absolute bg-black/70 pointer-events-none"
              style={{ 
                top: targetRect.top - 8, 
                right: 0,
                left: targetRect.right + 8,
                height: targetRect.height + 16
              }}
            />
            
            <div 
              className="absolute bg-black/70 pointer-events-none"
              style={{ 
                top: targetRect.bottom + 8, 
                left: 0, 
                right: 0, 
                bottom: 0 
              }}
            />
          </>
        )}
        {!targetRect && (
          <div className="absolute inset-0 bg-black/70 pointer-events-none" />
        )}
      </div>

      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="z-[10002] w-[380px] max-w-[calc(100vw-32px)]"
          style={getTooltipStyle()}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-5 py-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-xl">{step.title}</h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    {TUTORIAL_STEPS.map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={false}
                        animate={{
                          width: idx === currentStep ? 24 : idx < currentStep ? 16 : 8,
                          backgroundColor: idx <= currentStep ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                        }}
                        className="h-2 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[16px]">
                {step.description}
              </p>

              
              {step.requiresClick && isWaitingForClick && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl border-2 border-amber-300 dark:border-amber-600"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <CursorArrowRaysIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <span className="font-bold text-amber-700 dark:text-amber-300 text-lg">
                    {step.clickText}
                  </span>
                </motion.div>
              )}

              
              {!step.requiresClick && (
                <div className="mt-6 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={goToNextStep}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
                  >
                    {isLastStep ? (
                      <>
                        Zakończ tutorial
                        <CheckIcon className="w-6 h-6" />
                      </>
                    ) : (
                      <>
                        Rozumiem, dalej
                        <ArrowRightIcon className="w-6 h-6" />
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              
              {step.requiresClick && (
                <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 text-center font-medium">
                  ⚡ Kliknij podświetlony element aby kontynuować
                </p>
              )}
            </div>
          </div>

          
          {targetRect && step.position !== 'center' && (
            <div
              className="absolute w-4 h-4 bg-white dark:bg-slate-800 rotate-45"
              style={{
                ...(step.position === 'top' && {
                  bottom: -8,
                  left: '50%',
                  marginLeft: -8,
                  borderRight: '1px solid rgb(226, 232, 240)',
                  borderBottom: '1px solid rgb(226, 232, 240)',
                }),
                ...(step.position === 'bottom' && {
                  top: -8,
                  left: '50%',
                  marginLeft: -8,
                  borderLeft: '1px solid rgb(226, 232, 240)',
                  borderTop: '1px solid rgb(226, 232, 240)',
                }),
                ...(step.position === 'left' && {
                  right: -8,
                  top: '50%',
                  marginTop: -8,
                  borderRight: '1px solid rgb(226, 232, 240)',
                  borderTop: '1px solid rgb(226, 232, 240)',
                }),
                ...(step.position === 'right' && {
                  left: -8,
                  top: '50%',
                  marginTop: -8,
                  borderLeft: '1px solid rgb(226, 232, 240)',
                  borderBottom: '1px solid rgb(226, 232, 240)',
                }),
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      
      {targetRect && step.requiresClick && (
        <motion.div
          className="fixed z-[10003] pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1,
            scale: 1,
            y: [0, -15, 0],
          }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
            y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            top: targetRect.top - 60,
            left: targetRect.left + targetRect.width / 2 - 24,
          }}
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-yellow-400 rounded-full blur-xl"
            />
            <HandRaisedIcon className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
          </div>
        </motion.div>
      )}
    </>
  )
}
