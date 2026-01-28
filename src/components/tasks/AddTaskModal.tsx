/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { Fragment, useState, useEffect, useActionState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { Input, Button } from '@/components/ui'
import { CategoryPicker } from './CategoryPicker'
import { createTask, TaskFormState } from '@/lib/actions/tasks'
import { Category } from '@prisma/client'
import { useToast } from '@/components/ui/Toast'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/utils/constants'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onCategoryCreate?: () => void
}

const initialState: TaskFormState = {}

const RECURRING_OPTIONS = [
  { value: '', label: 'Jednorazowe' },
  { value: 'DAILY', label: 'Codziennie' },
  { value: 'WEEKLY', label: 'Co tydzień' },
  { value: 'MONTHLY', label: 'Co miesiąc' },
  { value: 'CUSTOM', label: 'Niestandardowa' },
]

const DAYS_OF_WEEK = [
  { value: 0, label: 'Nd' },
  { value: 1, label: 'Pn' },
  { value: 2, label: 'Wt' },
  { value: 3, label: 'Śr' },
  { value: 4, label: 'Cz' },
  { value: 5, label: 'Pt' },
  { value: 6, label: 'So' },
]

export function AddTaskModal({ isOpen, onClose, categories, onCategoryCreate }: AddTaskModalProps) {
  const { success: showSuccess, error: showError } = useToast()
  const [state, formAction, isPending] = useActionState(createTask, initialState)
  
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [priority, setPriority] = useState(2)
  const [dueDate, setDueDate] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('30')
  const [recurringType, setRecurringType] = useState('')
  const [recurringDays, setRecurringDays] = useState<number[]>([1, 2, 3, 4, 5]) // Mon-Fri by default
  const [recurringEndDate, setRecurringEndDate] = useState('')
  const [customInterval, setCustomInterval] = useState('2') // domyślnie co 2 dni

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategoryId(null)
      setPriority(2)
      setDueDate('')
      setEstimatedMinutes('30')
      setRecurringType('')
      setRecurringDays([1, 2, 3, 4, 5])
      setRecurringEndDate('')
      setCustomInterval('2')
    }
  }, [isOpen])

  // Handle success/error
  useEffect(() => {
    if (state.success) {
      showSuccess('Zadanie utworzone', `"${state.data?.title}" zostało dodane`)
      onClose()
    } else if (state.error) {
      showError('Błąd', state.error)
    }
  }, [state, showSuccess, showError, onClose])

  const handleSubmit = (formData: FormData) => {
    formData.set('categoryId', categoryId || '')
    formData.set('priority', priority.toString())
    formData.set('estimatedMinutes', estimatedMinutes)
    if (dueDate) {
      formData.set('dueDate', dueDate)
    }
    // Recurring task fields
    formData.set('isRecurring', recurringType ? 'true' : 'false')
    if (recurringType) {
      formData.set('recurringType', recurringType)
      if (recurringType === 'WEEKLY') {
        formData.set('recurringDays', JSON.stringify(recurringDays))
      }
      if (recurringType === 'CUSTOM') {
        formData.set('customInterval', customInterval)
      }
      if (recurringEndDate) {
        formData.set('recurringEndDate', recurringEndDate)
      }
    }
    formAction(formData)
  }

  return (
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
                    Nowe zadanie
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
                  <Input
                    label="Tytuł zadania"
                    name="title"
                    placeholder="np. Przygotować prezentację"
                    error={state.fieldErrors?.title}
                    required
                    autoFocus
                  />

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Opis (opcjonalny)
                    </label>
                    <textarea
                      name="description"
                      rows={3}
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

                  {/* Recurring */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Powtarzalność
                    </label>
                    <select
                      value={recurringType}
                      onChange={(e) => setRecurringType(e.target.value)}
                      className={cn(
                        'w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
                        'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                      )}
                    >
                      {RECURRING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Weekly days selector */}
                    {recurringType === 'WEEKLY' && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          Wybierz dni tygodnia:
                        </p>
                        <div className="flex gap-1">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => {
                                setRecurringDays((prev) =>
                                  prev.includes(day.value)
                                    ? prev.filter((d) => d !== day.value)
                                    : [...prev, day.value].sort()
                                )
                              }}
                              className={cn(
                                'w-9 h-9 rounded-lg text-xs font-medium transition-all',
                                recurringDays.includes(day.value)
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                              )}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom interval selector */}
                    {recurringType === 'CUSTOM' && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          Powtarzaj co:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={customInterval}
                            onChange={(e) => setCustomInterval(e.target.value)}
                            className={cn(
                              'w-20 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600',
                              'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100',
                              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center'
                            )}
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {parseInt(customInterval) === 1 ? 'dzień' : 'dni'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Np. co 2 dni, co 14 dni, itp.
                        </p>
                      </div>
                    )}

                    {/* Recurring end date */}
                    {recurringType && (
                      <div className="mt-3">
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Data zakończenia (opcjonalna)
                        </label>
                        <input
                          type="date"
                          value={recurringEndDate}
                          onChange={(e) => setRecurringEndDate(e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600',
                            'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm'
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
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
                      <PlusIcon className="w-5 h-5 mr-1" />
                      Dodaj zadanie
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
