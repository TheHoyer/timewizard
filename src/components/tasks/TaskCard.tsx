'use client'

import { cn } from '@/lib/utils/cn'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/utils/constants'
import { Task, Category } from '@prisma/client'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import {
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

interface TaskCardProps {
  task: Task & { category?: Category | null }
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onComplete?: (taskId: string) => void
}

export function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps) {
  const priorityColors = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
  const isCompleted = task.status === 'COMPLETED'

  const handleCardClick = (e: React.MouseEvent) => {
    
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="menu"]')) return
    onEdit?.(task)
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
        isCompleted && 'opacity-60'
      )}
    >
      
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
          priorityColors.bg.replace('bg-', 'bg-').replace('-100', '-500')
        )}
      />

      <div className="pl-3">
        
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'font-medium text-slate-900 dark:text-white truncate',
                isCompleted && 'line-through'
              )}
            >
              {task.title}
            </h3>
            {task.category && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1"
                style={{
                  backgroundColor: `${task.category.color}20`,
                  color: task.category.color,
                }}
              >
                {task.category.name}
              </span>
            )}
          </div>

          
          <Menu as="div" className="relative">
            <MenuButton className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100">
              <EllipsisVerticalIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </MenuButton>
            <MenuItems className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() => onComplete?.(task.id)}
                    className={cn(
                      'flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200',
                      focus ? 'bg-slate-100 dark:bg-slate-700' : ''
                    )}
                  >
                    <CheckCircleIcon className={cn('w-4 h-4 mr-2', isCompleted ? 'text-orange-500' : 'text-green-500')} />
                    {isCompleted ? 'Oznacz jako nieukończone' : 'Oznacz jako ukończone'}
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() => onEdit?.(task)}
                    className={cn(
                      'flex items-center w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200',
                      focus ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : ''
                    )}
                  >
                    Edytuj
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() => onDelete?.(task.id)}
                    className={cn(
                      'flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400',
                      focus ? 'bg-red-50 dark:bg-red-900/20' : ''
                    )}
                  >
                    Usuń
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>

        
        {task.description && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{task.description}</p>
        )}

        
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{task.estimatedMinutes} min</span>
          </div>

          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>
                {format(new Date(task.dueDate), 'd MMM yyyy', { locale: pl })}
              </span>
            </div>
          )}

          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              priorityColors.bg,
              priorityColors.text
            )}
          >
            {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
          </span>
        </div>
      </div>
    </div>
  )
}
