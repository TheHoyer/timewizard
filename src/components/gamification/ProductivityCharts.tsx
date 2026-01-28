'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { format, subDays, startOfWeek, addDays, eachDayOfInterval, isWithinInterval } from 'date-fns'
import { pl } from 'date-fns/locale'

// Types
interface TaskData {
  id: string
  status: string
  completedAt?: Date | null
  createdAt: Date
  priority: number
  estimatedMinutes: number
  categoryId?: string | null
}

interface DailyData {
  date: string
  completed: number
  created: number
  dayName: string
}

interface CategoryData {
  name: string
  value: number
  color: string
}

// Weekly Activity Chart
interface WeeklyActivityChartProps {
  tasks: TaskData[]
  height?: number
}

export function WeeklyActivityChart({ tasks, height = 300 }: WeeklyActivityChartProps) {
  const data = useMemo(() => {
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
    const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })

    return days.map(day => {
      const dayStart = new Date(day.setHours(0, 0, 0, 0))
      const dayEnd = new Date(day.setHours(23, 59, 59, 999))

      const completed = tasks.filter(
        t => t.completedAt && isWithinInterval(new Date(t.completedAt), { start: dayStart, end: dayEnd })
      ).length

      const created = tasks.filter(
        t => isWithinInterval(new Date(t.createdAt), { start: dayStart, end: dayEnd })
      ).length

      return {
        date: format(day, 'dd.MM'),
        dayName: format(day, 'EEE', { locale: pl }),
        completed,
        created,
      }
    })
  }, [tasks])

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis 
            dataKey="dayName" 
            className="text-slate-600 dark:text-slate-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-slate-600 dark:text-slate-400"
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const data = payload[0].payload as DailyData
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    {data.dayName}, {data.date}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Ukończone: {data.completed}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    + Utworzone: {data.created}
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Ukończone" />
          <Bar dataKey="created" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Utworzone" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Monthly Trend Chart
interface MonthlyTrendChartProps {
  tasks: TaskData[]
  days?: number
  height?: number
}

export function MonthlyTrendChart({ tasks, days = 30, height = 300 }: MonthlyTrendChartProps) {
  const data = useMemo(() => {
    const today = new Date()
    const startDate = subDays(today, days - 1)
    const daysArray = eachDayOfInterval({ start: startDate, end: today })

    return daysArray.map(day => {
      const dayStart = new Date(day.setHours(0, 0, 0, 0))
      const dayEnd = new Date(day.setHours(23, 59, 59, 999))

      const completed = tasks.filter(
        t => t.completedAt && isWithinInterval(new Date(t.completedAt), { start: dayStart, end: dayEnd })
      ).length

      return {
        date: format(day, 'dd.MM'),
        completed,
      }
    })
  }, [tasks, days])

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis 
            dataKey="date" 
            className="text-slate-600 dark:text-slate-400"
            tick={{ fontSize: 10 }}
            interval={Math.floor(days / 7)}
          />
          <YAxis 
            className="text-slate-600 dark:text-slate-400"
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {payload[0].payload.date}
                  </p>
                  <p className="text-sm text-violet-600 dark:text-violet-400">
                    Ukończone: {payload[0].value}
                  </p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#completedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Category Distribution Chart
interface CategoryDistributionChartProps {
  tasks: TaskData[]
  categories: Array<{ id: string; name: string; color: string }>
  height?: number
}

export function CategoryDistributionChart({ tasks, categories, height = 300 }: CategoryDistributionChartProps) {
  const data = useMemo(() => {
    const categoryMap = new Map<string, { name: string; value: number; color: string }>()

    // Initialize with all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { name: cat.name, value: 0, color: cat.color })
    })

    // Add uncategorized
    categoryMap.set('uncategorized', { name: 'Bez kategorii', value: 0, color: '#94a3b8' })

    // Count tasks per category
    tasks.forEach(task => {
      const key = task.categoryId || 'uncategorized'
      const current = categoryMap.get(key)
      if (current) {
        current.value++
      }
    })

    return Array.from(categoryMap.values()).filter(d => d.value > 0)
  }, [tasks, categories])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
        Brak danych do wyświetlenia
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const data = payload[0].payload as CategoryData
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: data.color }} 
                    />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {data.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {data.value} {data.value === 1 ? 'zadanie' : 'zadań'}
                  </p>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Priority Distribution Chart
interface PriorityDistributionChartProps {
  tasks: TaskData[]
  height?: number
}

const PRIORITY_COLORS = ['#94a3b8', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444']
const PRIORITY_LABELS = ['Niski', 'Normalny', 'Średni', 'Wysoki', 'Krytyczny']

export function PriorityDistributionChart({ tasks, height = 200 }: PriorityDistributionChartProps) {
  const data = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    tasks.forEach(task => {
      if (task.priority >= 1 && task.priority <= 5) {
        counts[task.priority - 1]++
      }
    })
    return counts.map((count, index) => ({
      name: PRIORITY_LABELS[index],
      value: count,
      color: PRIORITY_COLORS[index],
    }))
  }, [tasks])

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" horizontal={false} />
          <XAxis 
            type="number" 
            className="text-slate-600 dark:text-slate-400"
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            className="text-slate-600 dark:text-slate-400"
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {payload[0].payload.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {payload[0].value} zadań
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Time Estimation Accuracy Chart
interface TimeAccuracyChartProps {
  tasks: Array<TaskData & { actualMinutes?: number }>
  height?: number
}

export function TimeAccuracyChart({ tasks, height = 300 }: TimeAccuracyChartProps) {
  const data = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED' && t.actualMinutes)
    
    if (completedTasks.length === 0) {
      return { underestimated: 0, accurate: 0, overestimated: 0 }
    }

    let underestimated = 0
    let accurate = 0
    let overestimated = 0

    completedTasks.forEach(task => {
      const ratio = (task.actualMinutes || 0) / task.estimatedMinutes
      if (ratio > 1.2) underestimated++
      else if (ratio < 0.8) overestimated++
      else accurate++
    })

    return { underestimated, accurate, overestimated }
  }, [tasks])

  const pieData = [
    { name: 'Niedoszacowane', value: data.underestimated, color: '#ef4444' },
    { name: 'Dokładne', value: data.accurate, color: '#22c55e' },
    { name: 'Przeszacowane', value: data.overestimated, color: '#3b82f6' },
  ].filter(d => d.value > 0)

  if (pieData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
        Brak danych o czasie realizacji
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
