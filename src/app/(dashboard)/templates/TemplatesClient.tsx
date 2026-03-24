'use client'

import { useState, useActionState } from 'react'
import { TaskTemplate, Category } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { createTemplate, deleteTemplate, createTaskFromTemplate, TemplateFormState } from '@/lib/actions/templates'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/utils/constants'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PlayIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface TemplatesClientProps {
  initialTemplates: TaskTemplate[]
  categories: Category[]
}

const initialState: TemplateFormState = {}

export function TemplatesClient({ initialTemplates, categories }: TemplatesClientProps) {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  
  const [templates, setTemplates] = useState(initialTemplates)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteModalTemplate, setDeleteModalTemplate] = useState<TaskTemplate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formState, formAction, isPending] = useActionState(createTemplate, initialState)

  
  if (formState.success && !isPending) {
    setIsCreateModalOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteModalTemplate) return

    setIsDeleting(true)
    const result = await deleteTemplate(deleteModalTemplate.id)
    setIsDeleting(false)

    if (result.success) {
      setTemplates(templates.filter(t => t.id !== deleteModalTemplate.id))
      showSuccess('Szablon usunięty', 'Szablon został usunięty')
      setDeleteModalTemplate(null)
    } else {
      showError('Błąd', result.error || 'Nie udało się usunąć szablonu')
    }
  }

  const handleUseTemplate = async (templateId: string) => {
    const result = await createTaskFromTemplate(templateId)
    if (result.success) {
      showSuccess('Zadanie utworzone', 'Zadanie zostało utworzone z szablonu')
      router.push('/tasks')
    } else {
      showError('Błąd', result.error || 'Nie udało się utworzyć zadania')
    }
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Szablony</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Twórz zadania z gotowych szablonów
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Nowy szablon
        </Button>
      </div>

      
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {templates.map((template, index) => {
              const subtasks = template.subtasks ? JSON.parse(template.subtasks) as string[] : []
              const category = categories.find(c => c.id === template.categoryId)

              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DocumentDuplicateIcon className="w-5 h-5 text-violet-500" />
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {template.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setDeleteModalTemplate(template)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {template.title}
                  </p>

                  {template.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {category && (
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        {category.name}
                      </span>
                    )}
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      PRIORITY_COLORS[template.priority as keyof typeof PRIORITY_COLORS]?.bg,
                      PRIORITY_COLORS[template.priority as keyof typeof PRIORITY_COLORS]?.text,
                    )}>
                      P{template.priority}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <ClockIcon className="w-3 h-3" />
                      {template.estimatedMinutes}m
                    </span>
                  </div>

                  {subtasks.length > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      {subtasks.length} podzadań
                    </div>
                  )}

                  <Button
                    onClick={() => handleUseTemplate(template.id)}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Użyj szablonu
                  </Button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16">
          <DocumentDuplicateIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Brak szablonów
          </h3>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Utwórz swój pierwszy szablon zadania
          </p>
          <Button className="mt-4 gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="w-4 h-4" />
            Nowy szablon
          </Button>
        </div>
      )}

      
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
        formAction={formAction}
        formState={formState}
        isPending={isPending}
      />

      
      <ConfirmModal
        isOpen={!!deleteModalTemplate}
        onClose={() => setDeleteModalTemplate(null)}
        onConfirm={handleDelete}
        title="Usuń szablon"
        description={`Czy na pewno chcesz usunąć szablon "${deleteModalTemplate?.name}"?`}
        confirmText="Usuń"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

function CreateTemplateModal({
  isOpen,
  onClose,
  categories,
  formAction,
  formState,
  isPending,
}: {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  formAction: (formData: FormData) => void
  formState: TemplateFormState
  isPending: boolean
}) {
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [newSubtask, setNewSubtask] = useState('')

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()])
      setNewSubtask('')
    }
  }

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  const handleSubmit = (formData: FormData) => {
    subtasks.forEach(s => formData.append('subtasks', s))
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
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                    Nowy szablon
                  </Dialog.Title>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <XMarkIcon className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nazwa szablonu
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="np. Daily Standup"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    {formState.fieldErrors?.name && (
                      <p className="text-red-500 text-sm mt-1">{formState.fieldErrors.name[0]}</p>
                    )}
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tytuł zadania
                    </label>
                    <input
                      name="title"
                      type="text"
                      required
                      placeholder="np. Przygotować prezentację"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Opis (opcjonalny)
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      placeholder="Szczegóły zadania..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    />
                  </div>

                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Priorytet
                      </label>
                      <select
                        name="priority"
                        defaultValue="2"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                      >
                        {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Czas (min)
                      </label>
                      <input
                        name="estimatedMinutes"
                        type="number"
                        min="1"
                        max="480"
                        defaultValue="30"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Kategoria
                    </label>
                    <select
                      name="categoryId"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Bez kategorii</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Podzadania
                    </label>
                    <div className="space-y-2">
                      {subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                          <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{subtask}</span>
                          <button type="button" onClick={() => removeSubtask(index)}>
                            <XMarkIcon className="w-4 h-4 text-slate-400 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                          placeholder="Dodaj podzadanie..."
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addSubtask}>
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {formState.error && (
                    <p className="text-red-500 text-sm">{formState.error}</p>
                  )}

                  
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Anuluj
                    </Button>
                    <Button type="submit" isLoading={isPending} className="flex-1">
                      Utwórz szablon
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
