'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { Task, Category } from '@prisma/client'
import { getTasks, deleteTask, updateTaskStatus, batchUpdateStatus, batchDelete, TaskFilters } from '@/lib/actions/tasks'
import { getCategories } from '@/lib/actions/categories'
import { TaskCard } from '@/components/tasks/TaskCard'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { EditTaskModal } from '@/components/tasks/EditTaskModal'
import { CategoryModal } from '@/components/tasks/CategoryModal'
import { QuickAdd } from '@/components/tasks/QuickAdd'
import { Button } from '@/components/ui'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'
import { ShortcutHint } from '@/components/ui/ShortcutHint'
import { cn } from '@/lib/utils/cn'
import { PRIORITY_LABELS } from '@/lib/utils/constants'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FolderPlusIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

type TaskWithCategory = Task & { category: Category | null }

interface TasksClientPageProps {
  initialTasks: TaskWithCategory[]
  initialCategories: Category[]
}

type ViewMode = 'grid' | 'list'
type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type StatusFilter = 'all' | TaskStatus
type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'title'
type SortOrder = 'asc' | 'desc'

export function TasksClientPage({ initialTasks, initialCategories }: TasksClientPageProps) {
  const { success: showSuccess, error: showError } = useToast()
  const [isPending, startTransition] = useTransition()

  
  const [tasks, setTasks] = useState<TaskWithCategory[]>(initialTasks)
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  
  const [sortBy, setSortBy] = useState<SortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskWithCategory | null>(null)

  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false)

  
  useKeyboardShortcuts([
    {
      ...KEYBOARD_SHORTCUTS.NEW_TASK,
      action: () => setIsAddModalOpen(true),
    },
    {
      ...KEYBOARD_SHORTCUTS.SEARCH,
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Szukaj"]') as HTMLInputElement
        searchInput?.focus()
      },
    },
  ])

  
  const fetchTasks = useCallback(async () => {
    const filters: TaskFilters = {}
    
    if (statusFilter !== 'all') filters.status = statusFilter as TaskStatus
    if (categoryFilter !== 'all') filters.categoryId = categoryFilter
    if (priorityFilter !== 'all') filters.priority = parseInt(priorityFilter)
    if (search.trim()) filters.search = search.trim()

    startTransition(async () => {
      const result = await getTasks(filters)
      if (result.success && result.data) {
        setTasks(result.data)
      }
    })
  }, [statusFilter, categoryFilter, priorityFilter, search])

  
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTasks()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchTasks])

  
  const fetchCategories = useCallback(async () => {
    const result = await getCategories()
    if (result.success && result.data) {
      setCategories(result.data)
    }
  }, [])

  
  const handleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    const result = await updateTaskStatus(taskId, newStatus)
    
    if (result.success) {
      if (newStatus === 'COMPLETED') {
        showSuccess('Zadanie ukończone', 'Brawo! Tak trzymaj! 🎉')
      } else {
        showSuccess('Zadanie przywrócone', 'Zadanie zostało oznaczone jako nieukończone')
      }
      fetchTasks()
    } else {
      showError('Błąd', result.error || 'Nie udało się zmienić statusu zadania')
    }
  }

  
  const handleDelete = async (taskId: string) => {
    setTaskToDelete(taskId)
    setIsDeleteModalOpen(true)
  }

  
  const confirmDelete = async () => {
    if (!taskToDelete) return
    
    setIsDeleting(true)
    const result = await deleteTask(taskToDelete)
    setIsDeleting(false)
    
    if (result.success) {
      showSuccess('Zadanie usunięte', 'Zadanie zostało przeniesione do kosza')
      fetchTasks()
    } else {
      showError('Błąd', result.error || 'Nie udało się usunąć zadania')
    }
    
    setIsDeleteModalOpen(false)
    setTaskToDelete(null)
  }

  
  const handleEdit = (task: Task) => {
    setSelectedTask(task as TaskWithCategory)
    setIsEditModalOpen(true)
  }

  
  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedTask(null)
    fetchTasks()
  }

  
  const handleAddModalClose = () => {
    setIsAddModalOpen(false)
    fetchTasks()
  }

  
  const handleCategoryModalClose = () => {
    setIsCategoryModalOpen(false)
    fetchCategories()
  }

  
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setPriorityFilter('all')
  }

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || search.trim() !== ''

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedTasks(new Set())
  }

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  // Select all tasks
  const selectAllTasks = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.id)))
    }
  }

  // Batch complete selected tasks
  const handleBatchComplete = async () => {
    if (selectedTasks.size === 0) return
    const result = await batchUpdateStatus(Array.from(selectedTasks), 'COMPLETED')
    if (result.success) {
      showSuccess('Zadania ukończone', `${result.count || selectedTasks.size} zadań oznaczono jako ukończone`)
      setSelectedTasks(new Set())
      fetchTasks()
    } else {
      showError('Błąd', result.error || 'Nie udało się ukończyć zadań')
    }
  }

  
  const handleBatchDelete = async () => {
    if (selectedTasks.size === 0) return
    const result = await batchDelete(Array.from(selectedTasks))
    if (result.success) {
      showSuccess('Zadania usunięte', `${result.count || selectedTasks.size} zadań zostało usuniętych`)
      setSelectedTasks(new Set())
      setIsBatchDeleteOpen(false)
      fetchTasks()
    } else {
      showError('Błąd', result.error || 'Nie udało się usunąć zadań')
    }
  }

  
  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'priority':
        comparison = a.priority - b.priority
        break
      case 'dueDate':
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        comparison = dateA - dateB
        break
      case 'createdAt':
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'PENDING', label: 'Oczekujące' },
    { value: 'IN_PROGRESS', label: 'W trakcie' },
    { value: 'COMPLETED', label: 'Ukończone' },
  ]

  const priorityOptions = [
    { value: 'all', label: 'Wszystkie' },
    ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
  ]

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Zadania</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Zarządzaj swoimi zadaniami i śledź postępy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isSelectionMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={toggleSelectionMode}
            className="gap-2"
          >
            <CheckIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Zaznacz</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            className="gap-2"
          >
            <FolderPlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Kategoria</span>
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Nowe zadanie
            <ShortcutHint shortcut={KEYBOARD_SHORTCUTS.NEW_TASK} className="ml-1 hidden lg:inline-flex" />
          </Button>
        </div>
      </div>

      
      <QuickAdd
        onTaskCreated={fetchTasks}
      />

      
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-3 flex flex-wrap items-center gap-3">
              <button
                onClick={selectAllTasks}
                className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
              >
                {selectedTasks.size === tasks.length ? 'Odznacz wszystko' : 'Zaznacz wszystko'}
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Zaznaczono: {selectedTasks.size} z {tasks.length}
              </span>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchComplete}
                disabled={selectedTasks.size === 0}
                className="gap-2"
              >
                <CheckIcon className="w-4 h-4" />
                Ukończ
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsBatchDeleteOpen(true)}
                disabled={selectedTasks.size === 0}
                className="gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Usuń
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      <div className="flex flex-col sm:flex-row gap-3">
        
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Szukaj zadań..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
              'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
            )}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <XMarkIcon className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className={cn(
              'px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
              'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm'
            )}
          >
            <option value="createdAt">Data utworzenia</option>
            <option value="dueDate">Termin</option>
            <option value="priority">Priorytet</option>
            <option value="title">Tytuł</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={cn(
              'p-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
              'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700',
              'transition-colors'
            )}
            title={sortOrder === 'asc' ? 'Rosnąco' : 'Malejąco'}
          >
            <ArrowsUpDownIcon className={cn(
              'w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform',
              sortOrder === 'desc' && 'rotate-180'
            )} />
          </button>
        </div>

        
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <FunnelIcon className="w-4 h-4" />
            Filtry
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-violet-500" />
            )}
          </Button>

          
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 shadow-sm'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              <Squares2X2Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 shadow-sm'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              <ListBulletIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          
          <button
            onClick={fetchTasks}
            disabled={isPending}
            className={cn(
              'p-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
              'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700',
              'transition-colors',
              isPending && 'opacity-50'
            )}
          >
            <ArrowPathIcon className={cn('w-4 h-4 text-slate-600 dark:text-slate-300', isPending && 'animate-spin')} />
          </button>
        </div>
      </div>

      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600',
                      'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500'
                    )}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Kategoria
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600',
                      'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500'
                    )}
                  >
                    <option value="all">Wszystkie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Priorytet
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600',
                      'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500'
                    )}
                  >
                    {priorityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium"
                  >
                    Wyczyść filtry
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>
          {sortedTasks.length} {sortedTasks.length === 1 ? 'zadanie' : sortedTasks.length > 1 && sortedTasks.length < 5 ? 'zadania' : 'zadań'}
          {hasActiveFilters && ' (filtrowane)'}
        </span>
        {isPending && (
          <span className="flex items-center gap-1">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            Ładowanie...
          </span>
        )}
      </div>

      
      {sortedTasks.length > 0 ? (
        <motion.div
          layout
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'space-y-3'
          )}
        >
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  isSelectionMode && 'cursor-pointer',
                  isSelectionMode && selectedTasks.has(task.id) && 'ring-2 ring-violet-500 rounded-xl'
                )}
                onClick={isSelectionMode ? () => toggleTaskSelection(task.id) : undefined}
              >
                <TaskCard
                  task={task}
                  onEdit={isSelectionMode ? undefined : handleEdit}
                  onDelete={isSelectionMode ? undefined : handleDelete}
                  onComplete={isSelectionMode ? undefined : handleComplete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <ClipboardDocumentListIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            {hasActiveFilters ? 'Brak wyników' : 'Brak zadań'}
          </h3>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {hasActiveFilters
              ? 'Spróbuj zmienić filtry lub wyszukaj coś innego'
              : 'Utwórz swoje pierwsze zadanie, aby rozpocząć!'}
          </p>
          {hasActiveFilters ? (
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearFilters}
            >
              Wyczyść filtry
            </Button>
          ) : (
            <Button
              className="mt-4 gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4" />
              Dodaj zadanie
            </Button>
          )}
        </div>
      )}

      
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        categories={categories}
      />

      {selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          task={selectedTask}
          categories={categories}
        />
      )}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCategoryModalClose}
      />

      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setTaskToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Usuń zadanie"
        description="Czy na pewno chcesz usunąć to zadanie? Zadanie zostanie przeniesione do kosza i będzie można je przywrócić."
        confirmText="Usuń"
        cancelText="Anuluj"
        variant="danger"
        isLoading={isDeleting}
      />

      
      <ConfirmModal
        isOpen={isBatchDeleteOpen}
        onClose={() => setIsBatchDeleteOpen(false)}
        onConfirm={handleBatchDelete}
        title="Usuń zaznaczone zadania"
        description={`Czy na pewno chcesz usunąć ${selectedTasks.size} zaznaczonych zadań? Ta operacja jest nieodwracalna.`}
        confirmText="Usuń wszystkie"
        cancelText="Anuluj"
        variant="danger"
      />
    </div>
  )
}
