'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  FireIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'
import {
  WeeklyActivityChart,
  MonthlyTrendChart,
  CategoryDistributionChart,
  PriorityDistributionChart,
} from '@/components/gamification/ProductivityCharts'

type StatsData = {
  period: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  totalEstimatedTime: number
  completedTime: number
  dailyStats: Array<{ date: string; created: number; completed: number }>
  categoryStats: Array<{ name: string; count: number; completed: number; color: string; id: string }>
  priorityStats: Array<{ priority: number; total: number; completed: number }>
  tasks: Array<{
    id: string
    status: string
    completedAt?: Date | null
    createdAt: Date
    priority: number
    estimatedMinutes: number
    categoryId?: string | null
  }>
}

interface StatsClientProps {
  initialWeekStats: StatsData | null
  initialMonthStats: StatsData | null
}

export function StatsClient({ initialWeekStats, initialMonthStats }: StatsClientProps) {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const stats = period === 'week' ? initialWeekStats : initialMonthStats

  if (!stats) {
    return (
      <div className="text-center py-16">
        <ChartBarIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          Brak danych
        </h3>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Utwórz zadania, aby zobaczyć statystyki
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Statystyki</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Analiza Twojej produktywności
          </p>
        </div>

        
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                period === p
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {p === 'week' ? 'Tydzień' : 'Miesiąc'}
            </button>
          ))}
        </div>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={ChartBarIcon}
          label="Wszystkie zadania"
          value={stats.totalTasks}
          color="violet"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Ukończone"
          value={stats.completedTasks}
          color="green"
        />
        <StatCard
          icon={FireIcon}
          label="Skuteczność"
          value={`${stats.completionRate}%`}
          color="orange"
        />
        <StatCard
          icon={ClockIcon}
          label="Czas ukończony"
          value={`${Math.round(stats.completedTime / 60)}h`}
          color="blue"
        />
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-violet-500" />
            Aktywność dzienna
          </h3>
          {stats.tasks && stats.tasks.length > 0 ? (
            period === 'week' ? (
              <WeeklyActivityChart tasks={stats.tasks} height={250} />
            ) : (
              <MonthlyTrendChart tasks={stats.tasks} days={30} height={250} />
            )
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400 dark:text-slate-500">
              Brak danych do wyświetlenia
            </div>
          )}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              Ukończone
            </div>
            {period === 'week' && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                Utworzone
              </div>
            )}
          </div>
        </div>

        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-amber-500" />
            Podział na kategorie
          </h3>
          {stats.tasks && stats.categoryStats && stats.categoryStats.length > 0 ? (
            <CategoryDistributionChart 
              tasks={stats.tasks}
              categories={stats.categoryStats.map(cat => ({
                id: cat.id || cat.name,
                name: cat.name,
                color: cat.color,
              }))}
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400 dark:text-slate-500">
              Brak danych kategorii
            </div>
          )}
        </div>
      </div>

      
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Rozkład priorytetów
        </h3>
        {stats.tasks && stats.tasks.length > 0 ? (
          <PriorityDistributionChart tasks={stats.tasks} height={200} />
        ) : (
          <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-slate-500">
            Brak danych priorytetów
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: 'violet' | 'green' | 'orange' | 'blue'
}) {
  const colors = {
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </motion.div>
  )
}
