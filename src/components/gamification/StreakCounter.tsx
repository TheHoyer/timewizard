'use client'

import { motion } from 'framer-motion'
import { FireIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils/cn'

interface StreakCounterProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animate?: boolean
}

export function StreakCounter({ 
  streak, 
  size = 'md', 
  showLabel = true,
  animate = true 
}: StreakCounterProps) {
  const sizeClasses = {
    sm: {
      container: 'px-3 py-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
      label: 'text-xs',
    },
    md: {
      container: 'px-4 py-2',
      icon: 'w-5 h-5',
      text: 'text-lg',
      label: 'text-sm',
    },
    lg: {
      container: 'px-6 py-3',
      icon: 'w-7 h-7',
      text: 'text-2xl',
      label: 'text-base',
    },
  }

  const classes = sizeClasses[size]

  // Determine flame color based on streak length
  const getFlameColor = () => {
    if (streak >= 100) return 'text-purple-500' // Legendary
    if (streak >= 30) return 'text-yellow-400' // Gold
    if (streak >= 7) return 'text-orange-500' // Fire
    return 'text-orange-400' // Normal
  }

  // Determine background gradient
  const getGradient = () => {
    if (streak >= 100) return 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
    if (streak >= 30) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    if (streak >= 7) return 'from-orange-500/20 to-red-500/20 border-orange-500/30'
    return 'from-orange-400/20 to-red-400/20 border-orange-400/30'
  }

  const FlameAnimation = animate ? motion.div : 'div'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border bg-gradient-to-r',
        getGradient(),
        classes.container
      )}
    >
      <FlameAnimation
        {...(animate && {
          animate: {
            scale: [1, 1.2, 1],
            rotate: [-5, 5, -5],
          },
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        })}
      >
        <FireIcon className={cn(classes.icon, getFlameColor())} />
      </FlameAnimation>
      
      <div className="flex flex-col">
        <span className={cn('font-bold text-slate-900 dark:text-white', classes.text)}>
          {streak}
        </span>
        {showLabel && (
          <span className={cn('text-slate-500 dark:text-slate-400 -mt-1', classes.label)}>
            {streak === 1 ? 'dzień' : streak < 5 ? 'dni' : 'dni'}
          </span>
        )}
      </div>

      {/* Milestone indicators */}
      {streak >= 7 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-1"
        >
          {streak >= 100 ? (
            <span title="Legenda!">👑</span>
          ) : streak >= 30 ? (
            <span title="Mistrz!">⭐</span>
          ) : (
            <span title="Tygodniowy streak!">🔥</span>
          )}
        </motion.div>
      )}
    </div>
  )
}

// Compact version for inline use
export function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
      <FireIcon className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold">{streak}</span>
    </div>
  )
}
