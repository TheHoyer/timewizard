'use client'

import { motion } from 'framer-motion'
import { Achievement, UserStats } from '@/lib/actions/gamification'
import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  SparklesIcon,
  CheckBadgeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface AchievementsClientPageProps {
  achievements: Achievement[]
  stats: UserStats | null
}

export function AchievementsClientPage({ achievements, stats }: AchievementsClientPageProps) {
  const unlockedAchievements = achievements.filter(a => a.isUnlocked)
  const lockedAchievements = achievements.filter(a => !a.isUnlocked)

  // Calculate XP progress
  const xpProgress = stats?.xpProgress || 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <TrophyIcon className="w-7 h-7 text-yellow-500" />
          Osiągnięcia
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Zdobywaj odznaki za produktywność
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Level & XP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-violet-200 text-sm">Twój poziom</p>
                <p className="text-4xl font-bold">{stats.level}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <SparklesIcon className="w-8 h-8" />
              </div>
            </div>
            
            {/* XP Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm text-violet-200 mb-1">
                <span>{stats.xp} XP</span>
                <span>{stats.xpToNextLevel} XP do następnego poziomu</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <FireIcon className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Streak</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stats.streakCount} dni
            </p>
          </motion.div>

          {/* Tasks completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckBadgeIcon className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ukończone</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stats.totalTasksCompleted}
            </p>
          </motion.div>
        </div>
      )}

      {/* Achievements progress */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Postęp osiągnięć
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {unlockedAchievements.length} / {achievements.length}
          </span>
        </div>
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
          />
        </div>
      </div>

      {/* Unlocked achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-yellow-500" />
            Zdobyte osiągnięcia ({unlockedAchievements.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border-2 border-yellow-400/50 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {achievement.description}
                    </p>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        Zdobyto: {format(new Date(achievement.unlockedAt), 'd MMMM yyyy', { locale: pl })}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <LockClosedIcon className="w-5 h-5 text-slate-400" />
            Do zdobycia ({lockedAchievements.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0 grayscale opacity-50">
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-600 dark:text-slate-400">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                      {achievement.description}
                    </p>
                  </div>
                  <LockClosedIcon className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
