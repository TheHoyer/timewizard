'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { markTooltipShown } from '@/lib/actions/onboarding'

export interface TooltipConfig {
  id: string
  title: string
  description: string
  targetSelector: string 
  position?: 'top' | 'bottom' | 'left' | 'right'
  showAfterDays?: number 
}


export const ONBOARDING_TOOLTIPS: TooltipConfig[] = [
  {
    id: 'quick-add',
    title: 'Szybkie dodawanie',
    description: 'Kliknij tutaj, aby błyskawicznie dodać nowe zadanie bez otwierania formularza.',
    targetSelector: '[data-tooltip="quick-add"]',
    position: 'bottom',
  },
  {
    id: 'command-palette',
    title: 'Paleta poleceń',
    description: 'Naciśnij ⌘K (lub Ctrl+K), aby szybko nawigować i wykonywać akcje.',
    targetSelector: '[data-tooltip="command-palette"]',
    position: 'bottom',
    showAfterDays: 1,
  },
  {
    id: 'task-priority',
    title: 'Priorytety zadań',
    description: 'Kolorowe wskaźniki pokazują priorytet - od niskiego (szary) do krytycznego (czerwony).',
    targetSelector: '[data-tooltip="task-priority"]',
    position: 'left',
  },
  {
    id: 'categories',
    title: 'Kategorie',
    description: 'Grupuj zadania w kategorie, aby łatwiej je organizować i filtrować.',
    targetSelector: '[data-tooltip="categories"]',
    position: 'right',
    showAfterDays: 2,
  },
  {
    id: 'statistics',
    title: 'Statystyki',
    description: 'Śledź swoją produktywność i analizuj postępy w czasie.',
    targetSelector: '[data-tooltip="statistics"]',
    position: 'right',
    showAfterDays: 3,
  },
]

interface OnboardingTooltipProps {
  tooltips: TooltipConfig[]
  shownTooltips: string[]
  showTooltips: boolean
}

export function OnboardingTooltipProvider({
  tooltips,
  shownTooltips,
  showTooltips,
}: OnboardingTooltipProps) {
  const [currentTooltip, setCurrentTooltip] = useState<TooltipConfig | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showTooltips) return

    
    const nextTooltip = tooltips.find(
      (t) => !shownTooltips.includes(t.id)
    )

    if (nextTooltip) {
      
      const timer = setTimeout(() => {
        const target = document.querySelector(nextTooltip.targetSelector)
        if (target) {
          const rect = target.getBoundingClientRect()
          const tooltipWidth = 280
          const tooltipHeight = 120
          const padding = 12

          let top = 0
          let left = 0
          let arrow: 'top' | 'bottom' | 'left' | 'right' = 'top'

          switch (nextTooltip.position) {
            case 'bottom':
              top = rect.bottom + padding
              left = rect.left + rect.width / 2 - tooltipWidth / 2
              arrow = 'top'
              break
            case 'top':
              top = rect.top - tooltipHeight - padding
              left = rect.left + rect.width / 2 - tooltipWidth / 2
              arrow = 'bottom'
              break
            case 'left':
              top = rect.top + rect.height / 2 - tooltipHeight / 2
              left = rect.left - tooltipWidth - padding
              arrow = 'right'
              break
            case 'right':
              top = rect.top + rect.height / 2 - tooltipHeight / 2
              left = rect.right + padding
              arrow = 'left'
              break
          }

          
          left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16))
          top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16))

          setPosition({ top, left })
          setArrowPosition(arrow)
          setCurrentTooltip(nextTooltip)

          
          target.classList.add('ring-2', 'ring-violet-500', 'ring-offset-2', 'z-[100]')
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [tooltips, shownTooltips, showTooltips])

  const dismissTooltip = async () => {
    if (currentTooltip) {
      
      const target = document.querySelector(currentTooltip.targetSelector)
      if (target) {
        target.classList.remove('ring-2', 'ring-violet-500', 'ring-offset-2', 'z-[100]')
      }

      await markTooltipShown(currentTooltip.id)
      setCurrentTooltip(null)
    }
  }

  if (!currentTooltip || !showTooltips) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 9999,
        }}
        className="w-[280px]"
      >
        
        <div
          className={cn(
            'absolute w-3 h-3 bg-violet-600 rotate-45',
            arrowPosition === 'top' && 'top-[-6px] left-1/2 -translate-x-1/2',
            arrowPosition === 'bottom' && 'bottom-[-6px] left-1/2 -translate-x-1/2',
            arrowPosition === 'left' && 'left-[-6px] top-1/2 -translate-y-1/2',
            arrowPosition === 'right' && 'right-[-6px] top-1/2 -translate-y-1/2'
          )}
        />

        
        <div className="relative bg-violet-600 rounded-xl p-4 shadow-xl shadow-violet-500/25">
          
          <button
            onClick={dismissTooltip}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-white/70" />
          </button>

          
          <div className="flex items-center gap-2 mb-2">
            <LightBulbIcon className="w-5 h-5 text-yellow-300" />
            <h4 className="font-semibold text-white">{currentTooltip.title}</h4>
          </div>

          
          <p className="text-sm text-violet-100 leading-relaxed">
            {currentTooltip.description}
          </p>

          
          <button
            onClick={dismissTooltip}
            className="mt-3 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Rozumiem!
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
