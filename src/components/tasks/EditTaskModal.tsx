'use client'

import { Fragment, useState, useEffect, useActionState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CategoryPicker } from './CategoryPicker'
import { updateTask, deleteTask, TaskFormState } from '@/lib/actions/tasks'
import { Category, Task } from '@prisma/client'
import { useToast } from '@/components/ui/Toast'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/utils/constants'
import { format } from 'date-fns'

type TaskWithCategory = Task & { category?: Category | null }

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: TaskWithCategory | null
  categories: Category[]
  onCategoryCreate?: () => void
}

const initialState: TaskFormState = {}

export function EditTaskModal({ isOpen, onClose, task, categories, onCategoryCreate }: EditTaskModalProps) {
  const { success: showSuccess, error: showError } = useToast()
  const [state, formAction, isPending] = useActionState(updateTask, initialState)
  
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [priority, setPriority] = useState(2)
  const [dueDate, setDueDate] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('30')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load task data when modal opens
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setCategoryId(task.categoryId)
      setPriority(task.priority)
      setEstimatedMinutes(task.estimatedMinutes.toString())
      setDueDate(task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : '')
    }
  }, [isOpen, task])

  // Handle success/error
  useEffect(() => {
    if (state.success) {
      showSuccess('Zadanie zaktualizowane', `"${state.data?.title}" zostało zapisane`)
      onClose()
    } else if (state.error) {
      showError('Błąd', state.error)
    }
  }, [state, showSuccess, showError, onClose])

  const handleSubmit = (formData: FormData) => {
    if (!task) return
    formData.set('id', task.id)
    formData.set('title', title)
    formData.set('description', description)
    formData.set('categoryId', categoryId || '')
    formData.set('priority', priority.toString())
    formData.set('estimatedMinutes', estimatedMinutes)
    if (dueDate) {
      formData.set('dueDate', dueDate)
    }
    formAction(formData)
  }

  const handleDelete = async () => {
    if (!task) return
    
    setIsDeleting(true)
    const result = await deleteTask(task.id)
    setIsDeleting(false)
    setShowDeleteConfirm(false)

    if (result.success) {
      showSuccess('Zadanie usunięte', 'Zadanie zostało przeniesione do kosza')
      onClose()
    } else {
      showError('Błąd', result.error || 'Nie udało się usunąć zadania')
    }
  }

  if (!task) return null

  return (
    <>
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                    Edytuj zadanie
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Form */}
                <form action={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Tytuł zadania
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="np. Przygotować prezentację"
                      required
                      className={cn(
                        'w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
                        'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                        'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                      )}
                    />
                    {state.fieldErrors?.title && (
                      <p className="mt-1 text-sm text-red-600">{state.fieldErrors.title[0]}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Opis (opcjonalny)
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Dodatkowe szczegóły..."
                      className={cn(
                        'w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
                        'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                        'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                        'resize-none'
                      )}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Kategoria
                    </label>
                    <CategoryPicker
                      categories={categories}
                      value={categoryId}
                      onChange={setCategoryId}
                      onCreateNew={onCategoryCreate}
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Priorytet
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((p) => {
                        const colors = PRIORITY_COLORS[p as keyof typeof PRIORITY_COLORS]
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={cn(
                              'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                              'border-2',
                              priority === p
                                ? `${colors.bg} ${colors.text} ${colors.border}`
                                : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                            )}
                          >
                            {p}
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS]}
                    </p>
                  </div>

                  {/* Due date & Estimated time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Termin
                      </label>
                      <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={cn(
                          'w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
                          'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Szacowany czas (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="480"
                        value={estimatedMinutes}
                        onChange={(e) => setEstimatedMinutes(e.target.value)}
                        className={cn(
                          'w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
                          'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                        )}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Anuluj
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      isLoading={isPending}
                    >
                      Zapisz zmiany
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

    {/* Delete Confirmation Modal */}
    <ConfirmModal
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={handleDelete}
      title="Usuń zadanie"
      description={`Czy na pewno chcesz usunąć zadanie "${task.title}"? Zadanie zostanie przeniesione do kosza.`}
      confirmText="Usuń"
      cancelText="Anuluj"
      variant="danger"
      isLoading={isDeleting}
    />
    </>
  )
}
