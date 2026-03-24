'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { LockClosedIcon } from '@heroicons/react/24/outline'

interface AchievementBadgeProps {
  icon: string
  name: string
  description: string
  isUnlocked: boolean
  unlockedAt?: Date | null
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  onClick?: () => void
}

export function AchievementBadge({
  icon,
  name,
  description,
  isUnlocked,
  unlockedAt,
  size = 'md',
  showTooltip = true,
  onClick,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: {
      container: 'w-12 h-12',
      icon: 'text-xl',
      ring: 'ring-2',
    },
    md: {
      container: 'w-16 h-16',
      icon: 'text-3xl',
      ring: 'ring-3',
    },
    lg: {
      container: 'w-20 h-20',
      icon: 'text-4xl',
      ring: 'ring-4',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className="relative group">
      <motion.button
        whileHover={isUnlocked ? { scale: 1.1 } : undefined}
        whileTap={isUnlocked ? { scale: 0.95 } : undefined}
        onClick={onClick}
        className={cn(
          'relative rounded-full flex items-center justify-center transition-all',
          classes.container,
          isUnlocked
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25 cursor-pointer'
            : 'bg-slate-200 dark:bg-slate-700 cursor-default',
          isUnlocked && classes.ring,
          isUnlocked && 'ring-yellow-300 dark:ring-yellow-500'
        )}
      >
        {isUnlocked ? (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={classes.icon}
          >
            {icon}
          </motion.span>
        ) : (
          <LockClosedIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
        )}

        
        {isUnlocked && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '200%', opacity: [0, 0.5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12"
            />
          </div>
        )}
      </motion.button>

      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <div className="bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <p className="font-semibold text-sm">{name}</p>
            <p className="text-xs text-slate-300 dark:text-slate-400">{description}</p>
            {isUnlocked && unlockedAt && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Zdobyto: {new Date(unlockedAt).toLocaleDateString('pl-PL')}
              </p>
            )}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-8 border-transparent border-t-slate-900 dark:border-t-slate-700" />
          </div>
        </div>
      )}
    </div>
  )
}


interface AchievementGridProps {
  achievements: Array<{
    id: string
    icon: string
    name: string
    description: string
    isUnlocked: boolean
    unlockedAt?: Date | null
  }>
  size?: 'sm' | 'md' | 'lg'
  maxVisible?: number
}

export function AchievementGrid({ achievements, size = 'md', maxVisible }: AchievementGridProps) {
  const displayedAchievements = maxVisible 
    ? achievements.slice(0, maxVisible) 
    : achievements
  
  const remainingCount = maxVisible && achievements.length > maxVisible
    ? achievements.length - maxVisible
    : 0

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {displayedAchievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          icon={achievement.icon}
          name={achievement.name}
          description={achievement.description}
          isUnlocked={achievement.isUnlocked}
          unlockedAt={achievement.unlockedAt}
          size={size}
        />
      ))}
      
      {remainingCount > 0 && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium">
          +{remainingCount}
        </div>
      )}
    </div>
  )
}


interface AchievementNotificationProps {
  icon: string
  name: string
  description: string
  onClose: () => void
}

export function AchievementNotification({ icon, name, description, onClose }: AchievementNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-1 shadow-2xl shadow-yellow-500/30">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl"
          >
            {icon}
          </motion.div>
          
          <div className="flex-1">
            <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
              Nowe osiągnięcie!
            </p>
            <p className="font-bold text-slate-900 dark:text-white">{name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <span className="sr-only">Zamknij</span>
            <span className="text-slate-400">✕</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
