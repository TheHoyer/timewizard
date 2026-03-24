'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Subtask } from '@prisma/client'
import { 
  PlusIcon, 
  TrashIcon, 
  CheckIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { 
  getSubtasks, 
  createSubtask, 
  toggleSubtask, 
  deleteSubtask,
  reorderSubtasks,
} from '@/lib/actions/subtasks'

interface SubtaskListProps {
  taskId: string
  initialSubtasks?: Subtask[]
  onUpdate?: () => void
}

export function SubtaskList({ taskId, initialSubtasks = [], onUpdate }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks)
  const [newTitle, setNewTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadSubtasks = useCallback(async () => {
    const result = await getSubtasks(taskId)
    if (result.success && result.data) {
      setSubtasks(result.data)
    }
  }, [taskId])

  useEffect(() => {
    if (initialSubtasks.length === 0) {
      const timer = setTimeout(() => {
        void loadSubtasks()
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [initialSubtasks.length, loadSubtasks])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setIsAdding(true)
    const result = await createSubtask(taskId, newTitle.trim())
    setIsAdding(false)

    if (result.success && result.data) {
      setSubtasks([...subtasks, result.data])
      setNewTitle('')
      inputRef.current?.focus()
      onUpdate?.()
    }
  }

  const handleToggle = async (id: string) => {
    setLoadingId(id)
    const result = await toggleSubtask(id)
    setLoadingId(null)

    if (result.success && result.data) {
      setSubtasks(subtasks.map(s => s.id === id ? result.data! : s))
      onUpdate?.()
    }
  }

  const handleDelete = async (id: string) => {
    setLoadingId(id)
    const result = await deleteSubtask(id)
    setLoadingId(null)

    if (result.success) {
      setSubtasks(subtasks.filter(s => s.id !== id))
      onUpdate?.()
    }
  }

  const handleReorder = async (newOrder: Subtask[]) => {
    setSubtasks(newOrder)
    await reorderSubtasks(taskId, newOrder.map(s => s.id))
    onUpdate?.()
  }

  const completedCount = subtasks.filter(s => s.completed).length
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0

  return (
    <div className="space-y-3">
      
      {subtasks.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Postęp podzadań</span>
            <span>{completedCount}/{subtasks.length}</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      
      <Reorder.Group
        axis="y"
        values={subtasks}
        onReorder={handleReorder}
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {subtasks.map((subtask) => (
            <Reorder.Item
              key={subtask.id}
              value={subtask}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg',
                'bg-slate-50 dark:bg-slate-800/50',
                'group cursor-grab active:cursor-grabbing',
                loadingId === subtask.id && 'opacity-50'
              )}
            >
              
              <Bars3Icon className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              
              
              <button
                type="button"
                onClick={() => handleToggle(subtask.id)}
                disabled={loadingId === subtask.id}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                  subtask.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 hover:border-violet-500'
                )}
              >
                {subtask.completed && <CheckIcon className="w-3 h-3" />}
              </button>

              
              <span
                className={cn(
                  'flex-1 text-sm transition-all',
                  subtask.completed
                    ? 'text-slate-400 dark:text-slate-500 line-through'
                    : 'text-slate-700 dark:text-slate-300'
                )}
              >
                {subtask.title}
              </span>

              
              <button
                type="button"
                onClick={() => handleDelete(subtask.id)}
                disabled={loadingId === subtask.id}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
              </button>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Dodaj podzadanie..."
            disabled={isAdding}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700',
              'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
              'disabled:opacity-50'
            )}
          />
        </div>
        <button
          type="submit"
          disabled={isAdding || !newTitle.trim()}
          className={cn(
            'p-2 rounded-lg bg-violet-500 text-white',
            'hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          {isAdding ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PlusIcon className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  )
}


export function SubtaskProgress({ subtasks }: { subtasks?: Subtask[] }) {
  if (!subtasks || subtasks.length === 0) return null

  const completed = subtasks.filter(s => s.completed).length
  const total = subtasks.length
  const progress = (completed / total) * 100

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
        {completed}/{total}
      </span>
    </div>
  )
}
