'use client'

import { useState } from 'react'
import { Task, Category } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'
import { TaskCard } from '@/components/tasks/TaskCard'
import { EditTaskModal } from '@/components/tasks/EditTaskModal'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { useToast } from '@/components/ui/Toast'
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ChevronRightIcon,
  BoltIcon,
  TrophyIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { WeeklyProductivityScore } from '@/components/gamification/WeeklyProductivityScore'
import { AchievementBadge } from '@/components/gamification/AchievementBadge'

type TaskWithCategory = Task & { category: Category | null }

interface DashboardClientProps {
  user: {
    name: string
    streakCount: number
    totalTasksCompleted: number
    plan: string
    memberSince: Date
    xp: number
    level: number
  }
  stats: {
    totalTasks: number
    pendingTasks: number
    inProgressTasks: number
    completedTasks: number
    productivityPercent: number
    weeklyCompleted: number
    weeklyTotal: number
  }
  recentTasks: TaskWithCategory[]
  todayTasks: TaskWithCategory[]
  categories: Category[]
  recentAchievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: Date
  }>
}

export function DashboardClient({
  user,
  stats,
  recentTasks,
  todayTasks,
  categories,
  recentAchievements,
}: DashboardClientProps) {
  const { success: showSuccess, error: showError } = useToast()
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskWithCategory | null>(null)

  const handleComplete = async (taskId: string) => {
    const result = await updateTaskStatus(taskId, 'COMPLETED')
    if (result.success) {
      showSuccess('Zadanie ukończone', 'Brawo! Tak trzymaj! 🎉')
      router.refresh()
    } else {
      showError('Błąd', result.error || 'Nie udało się ukończyć zadania')
    }
  }

  const handleDelete = async (taskId: string) => {
    const result = await deleteTask(taskId)
    if (result.success) {
      showSuccess('Zadanie usunięte', 'Zadanie przeniesiono do kosza')
      router.refresh()
    } else {
      showError('Błąd', result.error || 'Nie udało się usunąć zadania')
    }
  }

  const handleEdit = (task: Task) => {
    setSelectedTask(task as TaskWithCategory)
    setIsEditModalOpen(true)
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Dzień dobry'
    if (hour < 18) return 'Cześć'
    return 'Dobry wieczór'
  }

  const motivationalMessage = () => {
    if (stats.productivityPercent >= 80) return 'Niesamowity wynik! Jesteś mistrzem produktywności! 🏆'
    if (stats.productivityPercent >= 50) return 'Świetna robota! Utrzymuj to tempo! 💪'
    if (stats.pendingTasks > 5) return 'Masz kilka zadań do wykonania. Czas na działanie! 🚀'
    return 'Gotowy na produktywny dzień? Zacznijmy! ✨'
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section with Gradient Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl shadow-violet-500/25 dark:shadow-violet-500/10"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl translate-y-24 -translate-x-24" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-violet-200 font-medium"
            >
              {format(new Date(), 'EEEE, d MMMM yyyy', { locale: pl })}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl lg:text-4xl font-bold mt-2"
            >
              {greeting()}, {user.name}! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-violet-100 mt-2 text-lg"
            >
              {motivationalMessage()}
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => setIsAddModalOpen(true)}
              data-tutorial="add-task"
              className="flex items-center gap-2 px-6 py-3 bg-white text-violet-700 rounded-xl font-semibold hover:bg-violet-50 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              Nowe zadanie
            </button>
          </motion.div>
        </div>

        {/* Quick stats in welcome card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-violet-200">
              <FireIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <p className="text-2xl font-bold mt-1">{user.streakCount} dni</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-violet-200">
              <CalendarDaysIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Na dziś</span>
            </div>
            <p className="text-2xl font-bold mt-1">{todayTasks.length} zadań</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-violet-200">
              <TrophyIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Ukończone</span>
            </div>
            <p className="text-2xl font-bold mt-1">{user.totalTasksCompleted}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-violet-200">
              <ArrowTrendingUpIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Produktywność</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.productivityPercent}%</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* XP & Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Poziom</span>
            </div>
            <span className="text-2xl font-bold">{user.level}</span>
          </div>
          <div className="mb-2">
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (user.xp % 100))}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
          <p className="text-xs opacity-80">{user.xp} XP</p>
        </motion.div>
        
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Wszystkie zadania"
          value={stats.totalTasks}
          color="violet"
          trend="+12%"
          delay={0.1}
        />
        <StatCard
          icon={ClockIcon}
          label="W trakcie"
          value={stats.pendingTasks + stats.inProgressTasks}
          color="blue"
          delay={0.2}
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Ukończone"
          value={stats.completedTasks}
          color="green"
          trend="+8%"
          delay={0.3}
        />
        <StatCard
          icon={FireIcon}
          label="Aktualny streak"
          value={`${user.streakCount} dni`}
          color="orange"
          delay={0.4}
        />
      </div>

      {/* Gamification Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Counter Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6"
        >
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
            Twój streak
          </h3>
          <div className="flex justify-center">
            <StreakCounter streak={user.streakCount} size="lg" animate />
          </div>
        </motion.div>

        {/* Weekly Productivity Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6"
        >
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
            Produktywność tygodnia
          </h3>
          <WeeklyProductivityScore
            completed={stats.weeklyCompleted}
            total={stats.weeklyTotal}
            showDetails
          />
        </motion.div>

        {/* Recent Achievements Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Ostatnie osiągnięcia
            </h3>
            <Link 
              href="/achievements"
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
            >
              Zobacz wszystkie
            </Link>
          </div>
          {recentAchievements.length > 0 ? (
            <div className="flex gap-2 justify-center flex-wrap">
              {recentAchievements.slice(0, 3).map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  icon={achievement.icon}
                  isUnlocked
                  unlockedAt={new Date(achievement.unlockedAt)}
                  size="md"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <TrophyIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Wykonuj zadania, aby zdobyć odznaki!
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
          data-tutorial="task-list"
        >
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <SparklesIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Najbliższe zadania</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Twoje priorytety na dziś</p>
                </div>
              </div>
              <Link 
                href="/tasks"
                className="flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                Zobacz wszystkie
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="p-6">
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {recentTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TaskCard
                          task={task}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onComplete={handleComplete}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <EmptyState
                  icon={RocketLaunchIcon}
                  title="Brak zadań do wyświetlenia"
                  description="Dodaj swoje pierwsze zadanie, aby rozpocząć!"
                  action={
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Dodaj zadanie
                    </button>
                  }
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Side Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* Progress Card */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Twój postęp</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Produktywność</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{stats.productivityPercent}%</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.productivityPercent}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedTasks}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ukończone</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingTasks + stats.inProgressTasks}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pozostało</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Focus */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <BoltIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Dzisiejsze zadania</h3>
            </div>
            
            {todayTasks.length > 0 ? (
              <div className="space-y-2">
                {todayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-colors",
                      "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    <button
                      onClick={() => handleComplete(task.id)}
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors",
                        task.status === 'COMPLETED'
                          ? "bg-green-500 border-green-500"
                          : "border-slate-300 dark:border-slate-600 hover:border-green-500"
                      )}
                    >
                      {task.status === 'COMPLETED' && (
                        <CheckCircleSolidIcon className="w-full h-full text-white" />
                      )}
                    </button>
                    <span className={cn(
                      "text-sm font-medium truncate",
                      task.status === 'COMPLETED'
                        ? "text-slate-400 dark:text-slate-500 line-through"
                        : "text-slate-700 dark:text-slate-200"
                    )}>
                      {task.title}
                    </span>
                  </div>
                ))}
                {todayTasks.length > 4 && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
                    +{todayTasks.length - 4} więcej
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Brak zadań na dziś
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-4">Szybkie akcje</h3>
            <div className="space-y-2">
              <Link
                href="/tasks"
                className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <ClipboardDocumentListIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Zarządzaj zadaniami</span>
              </Link>
              <Link
                href="/categories"
                className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <SparklesIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Kategorie</span>
              </Link>
              <Link
                href="/schedule"
                className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <CalendarDaysIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Harmonogram</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          router.refresh()
        }}
        categories={categories}
      />

      {selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedTask(null)
            router.refresh()
          }}
          task={selectedTask}
          categories={categories}
        />
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color: 'violet' | 'blue' | 'green' | 'orange'
  trend?: string
  delay?: number
}) {
  const colors = {
    violet: {
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      text: 'text-violet-600 dark:text-violet-400',
      gradient: 'from-violet-500 to-purple-500',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-cyan-500',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      gradient: 'from-green-500 to-emerald-500',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      gradient: 'from-orange-500 to-amber-500',
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 group hover:shadow-lg transition-all duration-300"
    >
      {/* Gradient accent */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity",
        colors[color].gradient
      )} />
      
      <div className="flex items-center justify-between">
        <div className={cn('p-3 rounded-xl', colors[color].bg)}>
          <Icon className={cn('w-6 h-6', colors[color].text)} />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      </div>
    </motion.div>
  )
}

// Empty State Component
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700/50 mb-4">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
