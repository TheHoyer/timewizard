'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, Category } from '@prisma/client'
import { cn } from '@/lib/utils/cn'
import { format, addDays, startOfDay, setHours, setMinutes, isSameDay, isToday } from 'date-fns'
import { pl } from 'date-fns/locale'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { PRIORITY_COLORS } from '@/lib/utils/constants'

type TaskWithCategory = Task & { category?: Category | null }

interface PlannerClientPageProps {
  initialTasks: TaskWithCategory[]
  categories: Category[]
}

// Time slots from 6:00 to 22:00
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => i + 6)

interface TimeBlock {
  id: string
  taskId: string | null
  task?: TaskWithCategory
  startHour: number
  duration: number // in hours
  title: string
  color: string
}

export function PlannerClientPage({ initialTasks, categories }: PlannerClientPageProps) {
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()))
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [draggedTask, setDraggedTask] = useState<TaskWithCategory | null>(null)

  // Filter unscheduled tasks (not completed)
  const unscheduledTasks = useMemo(() => {
    const scheduledTaskIds = new Set(timeBlocks.map(b => b.taskId))
    return initialTasks
      .filter(t => 
        t.status !== 'COMPLETED' && 
        t.status !== 'CANCELLED' && 
        !t.deletedAt &&
        !scheduledTaskIds.has(t.id)
      )
      .sort((a, b) => b.priority - a.priority)
  }, [initialTasks, timeBlocks])

  // Get blocks for current date
  const todayBlocks = useMemo(() => {
    return timeBlocks.filter(b => true) // In a real app, filter by date
  }, [timeBlocks, currentDate])

  const handlePreviousDay = () => {
    setCurrentDate(prev => addDays(prev, -1))
  }

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1))
  }

  const handleToday = () => {
    setCurrentDate(startOfDay(new Date()))
  }

  const handleDrop = (hour: number) => {
    if (!draggedTask) return

    // Calculate duration based on estimated minutes (minimum 1 hour, max 4 hours)
    const durationHours = Math.min(4, Math.max(1, Math.ceil(draggedTask.estimatedMinutes / 60)))

    const newBlock: TimeBlock = {
      id: `${draggedTask.id}-${Date.now()}`,
      taskId: draggedTask.id,
      task: draggedTask,
      startHour: hour,
      duration: durationHours,
      title: draggedTask.title,
      color: draggedTask.category?.color || '#6366f1',
    }

    setTimeBlocks(prev => [...prev, newBlock])
    setDraggedTask(null)
  }

  const removeBlock = (blockId: string) => {
    setTimeBlocks(prev => prev.filter(b => b.id !== blockId))
  }

  const getBlocksAtHour = (hour: number) => {
    return todayBlocks.filter(b => 
      hour >= b.startHour && hour < b.startHour + b.duration
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Planowanie dnia
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Przeciągnij zadania na oś czasu
          </p>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreviousDay}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          <button
            onClick={handleToday}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              isToday(currentDate)
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            )}
          >
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {isToday(currentDate) ? 'Dzisiaj' : format(currentDate, 'd MMMM yyyy', { locale: pl })}
            </span>
          </button>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Unscheduled tasks sidebar */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Niezaplanowane zadania
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Przeciągnij na oś czasu
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {unscheduledTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Wszystko zaplanowane!</p>
              </div>
            ) : (
              unscheduledTasks.map(task => (
                <TaskDragItem
                  key={task.id}
                  task={task}
                  onDragStart={() => setDraggedTask(task)}
                  onDragEnd={() => setDraggedTask(null)}
                />
              ))
            )}
          </div>
        </div>

        {/* Time grid */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {format(currentDate, 'EEEE, d MMMM', { locale: pl })}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="relative">
              {TIME_SLOTS.map(hour => {
                const blocks = getBlocksAtHour(hour)
                const isFirstHourOfBlock = blocks.some(b => b.startHour === hour)
                
                return (
                  <div
                    key={hour}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(hour)}
                    className={cn(
                      'flex border-b border-slate-100 dark:border-slate-700 min-h-[60px] group',
                      draggedTask && 'bg-violet-50/50 dark:bg-violet-900/10'
                    )}
                  >
                    {/* Time label */}
                    <div className="w-20 flex-shrink-0 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-700">
                      {hour}:00
                    </div>

                    {/* Time slot content */}
                    <div className="flex-1 relative min-h-[60px]">
                      {blocks.map(block => {
                        if (block.startHour !== hour) return null
                        
                        return (
                          <motion.div
                            key={block.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute left-2 right-2 z-10"
                            style={{
                              top: '4px',
                              height: `${block.duration * 60 - 8}px`,
                            }}
                          >
                            <div
                              className="h-full rounded-lg p-2 cursor-pointer group/block"
                              style={{
                                backgroundColor: `${block.color}20`,
                                borderLeft: `4px solid ${block.color}`,
                              }}
                              onClick={() => removeBlock(block.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                                    {block.title}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {block.startHour}:00 - {block.startHour + block.duration}:00
                                  </p>
                                </div>
                                <span className="text-xs opacity-0 group-hover/block:opacity-100 text-slate-400 dark:text-slate-500">
                                  Kliknij aby usunąć
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}

                      {/* Drop hint */}
                      {draggedTask && blocks.length === 0 && (
                        <div className="absolute inset-2 border-2 border-dashed border-violet-300 dark:border-violet-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-violet-500 dark:text-violet-400">
                            Upuść tutaj
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary footer */}
      <div className="mt-4 bg-white dark:bg-slate-800 rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Zaplanowane</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {todayBlocks.length} zadań
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Łączny czas</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {todayBlocks.reduce((sum, b) => sum + b.duration, 0)}h
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <ClockIcon className="w-4 h-4" />
            Jeszcze {unscheduledTasks.length} zadań do zaplanowania
          </div>
        </div>
      </div>
    </div>
  )
}

// Draggable task item
interface TaskDragItemProps {
  task: TaskWithCategory
  onDragStart: () => void
  onDragEnd: () => void
}

function TaskDragItem({ task, onDragStart, onDragEnd }: TaskDragItemProps) {
  const priorityColors = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 cursor-grab active:cursor-grabbing',
        'hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
        'border-l-4',
        priorityColors.border
      )}
    >
      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
        {task.title}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        {task.category && (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
            style={{
              backgroundColor: `${task.category.color}20`,
              color: task.category.color,
            }}
          >
            {task.category.icon && <span className="mr-0.5">{task.category.icon}</span>}
            {task.category.name}
          </span>
        )}
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          {task.estimatedMinutes} min
        </span>
      </div>
    </div>
  )
}
