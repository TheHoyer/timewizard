'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, Category } from '@prisma/client'
import { cn } from '@/lib/utils/cn'
import { updateTaskStatus, getTasks } from '@/lib/actions/tasks'
import { EditTaskModal } from '@/components/tasks/EditTaskModal'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { useToast } from '@/components/ui/Toast'
import {
  PlusIcon,
  ClockIcon,
  CalendarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { PRIORITY_COLORS } from '@/lib/utils/constants'

type TaskWithCategory = Task & { category?: Category | null }

interface KanbanClientPageProps {
  initialTasks: TaskWithCategory[]
  initialCategories: Category[]
}

const COLUMNS = [
  { 
    id: 'PENDING', 
    title: 'Do zrobienia', 
    color: 'bg-slate-500',
    bgColor: 'bg-slate-50 dark:bg-slate-900/50',
    icon: '📋'
  },
  { 
    id: 'IN_PROGRESS', 
    title: 'W trakcie', 
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: '🔄'
  },
  { 
    id: 'COMPLETED', 
    title: 'Ukończone', 
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: '✅'
  },
]

export function KanbanClientPage({ initialTasks, initialCategories }: KanbanClientPageProps) {
  const { success: showSuccess, error: showError } = useToast()
  const [tasks, setTasks] = useState<TaskWithCategory[]>(initialTasks)
  const categories = initialCategories
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithCategory | null>(null)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const refreshTasks = useCallback(async () => {
    const result = await getTasks({})
    if (result.success && result.data) {
      setTasks(result.data)
    }
  }, [])

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    
    if (!draggedTask) return

    const task = tasks.find(t => t.id === draggedTask)
    if (!task || task.status === newStatus) {
      handleDragEnd()
      return
    }

    
    setTasks(prev => prev.map(t => 
      t.id === draggedTask ? { ...t, status: newStatus } : t
    ))

    const result = await updateTaskStatus(
      draggedTask,
      newStatus as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    )

    if (result.error) {
      showError('Błąd', result.error)
      
      setTasks(prev => prev.map(t => 
        t.id === draggedTask ? { ...t, status: task.status } : t
      ))
    } else {
      if (newStatus === 'COMPLETED') {
        showSuccess('Zadanie ukończone! 🎉', 'Gratulacje!')
      }
    }

    handleDragEnd()
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status && !t.deletedAt)
  }

  return (
    <div className="h-full">
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Tablica Kanban
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Przeciągaj zadania między kolumnami
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshTasks}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Odśwież"
          >
            <ArrowPathIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nowe zadanie</span>
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {COLUMNS.map(column => {
          const columnTasks = getTasksByStatus(column.id)
          const isOver = dragOverColumn === column.id && draggedTask && 
            tasks.find(t => t.id === draggedTask)?.status !== column.id

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={cn(
                'flex flex-col rounded-xl border-2 border-dashed transition-all',
                column.bgColor,
                isOver 
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                  : 'border-slate-200 dark:border-slate-700'
              )}
            >
              
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{column.icon}</span>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      {column.title}
                    </h2>
                  </div>
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-sm font-medium text-white',
                    column.color
                  )}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <AnimatePresence mode="popLayout">
                  {columnTasks.map(task => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      onEdit={() => setEditingTask(task)}
                      isDragging={draggedTask === task.id}
                    />
                  ))}
                </AnimatePresence>

                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
                    <p className="text-sm">Brak zadań</p>
                    <p className="text-xs mt-1">Przeciągnij zadanie tutaj</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          refreshTasks()
        }}
        categories={categories}
      />

      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          onClose={() => {
            setEditingTask(null)
            refreshTasks()
          }}
          task={editingTask}
          categories={categories}
        />
      )}
    </div>
  )
}


interface KanbanCardProps {
  task: TaskWithCategory
  onDragStart: () => void
  onDragEnd: () => void
  onEdit: () => void
  isDragging: boolean
}

function KanbanCard({ task, onDragStart, onDragEnd, onEdit, isDragging }: KanbanCardProps) {
  const priorityColors = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onEdit}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 cursor-grab active:cursor-grabbing transition-all',
        'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
        isDragging && 'scale-105 shadow-lg rotate-2'
      )}
    >
      
      <div className={cn(
        'w-full h-1 rounded-full mb-2',
        priorityColors.bg.replace('-100', '-500')
      )} />

      
      <h3 className={cn(
        'font-medium text-slate-900 dark:text-white text-sm',
        task.status === 'COMPLETED' && 'line-through opacity-60'
      )}>
        {task.title}
      </h3>

      
      {task.category && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2"
          style={{
            backgroundColor: `${task.category.color}20`,
            color: task.category.color,
          }}
        >
          {task.category.icon && <span className="mr-1">{task.category.icon}</span>}
          {task.category.name}
        </span>
      )}

      
      {task.isRecurring && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ml-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
          <ArrowPathIcon className="w-3 h-3 mr-1" />
          {task.recurringType === 'DAILY' ? 'Codziennie' : 
           task.recurringType === 'WEEKLY' ? 'Co tydzień' : 'Co miesiąc'}
        </span>
      )}

      
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <ClockIcon className="w-3.5 h-3.5" />
          {task.estimatedMinutes} min
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            {format(new Date(task.dueDate), 'd MMM', { locale: pl })}
          </span>
        )}
      </div>
    </motion.div>
  )
}
