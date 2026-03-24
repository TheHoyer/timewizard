'use client'

import { useState, useTransition, useCallback } from 'react'
import { Category } from '@prisma/client'
import { getCategories, deleteCategory } from '@/lib/actions/categories'
import { CategoryModal } from '@/components/tasks/CategoryModal'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  SwatchIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface CategoriesClientPageProps {
  initialCategories: Category[]
}

export function CategoriesClientPage({ initialCategories }: CategoriesClientPageProps) {
  const { success: showSuccess, error: showError } = useToast()
  const [, startTransition] = useTransition()

  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    startTransition(async () => {
      const result = await getCategories()
      if (result.success && result.data) {
        setCategories(result.data)
      }
    })
  }, [])

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedCategory(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCategory(null)
    fetchCategories()
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    const result = await deleteCategory(categoryToDelete.id)
    setIsDeleting(false)

    if (result.success) {
      showSuccess('Kategoria usunięta', `"${categoryToDelete.name}" została usunięta`)
      setDeleteConfirmOpen(false)
      setCategoryToDelete(null)
      fetchCategories()
    } else {
      showError('Błąd', result.error || 'Nie udało się usunąć kategorii')
    }
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kategorie</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Organizuj swoje zadania za pomocą kategorii
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Nowa kategoria
        </Button>
      </div>

      
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700',
                  'p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
                  style={{ backgroundColor: category.color }}
                />

                <div className="pl-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <SwatchIcon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {category.color}
                      </p>
                    </div>
                  </div>

                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(category)}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        'hover:bg-slate-100 dark:hover:bg-slate-700',
                        'text-slate-600 dark:text-slate-400'
                      )}
                      title="Edytuj"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        'hover:bg-red-50 dark:hover:bg-red-900/20',
                        'text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                      )}
                      title="Usuń"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16">
          <SwatchIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Brak kategorii
          </h3>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Utwórz swoją pierwszą kategorię, aby organizować zadania
          </p>
          <Button className="mt-4 gap-2" onClick={handleAdd}>
            <PlusIcon className="w-4 h-4" />
            Dodaj kategorię
          </Button>
        </div>
      )}

      
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        category={selectedCategory}
      />

      
      <Transition appear show={deleteConfirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
        >
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                        Usunąć kategorię?
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Czy na pewno chcesz usunąć kategorię &ldquo;{categoryToDelete?.name}&rdquo;?
                        Zadania z tej kategorii nie zostaną usunięte.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setDeleteConfirmOpen(false)}
                      disabled={isDeleting}
                    >
                      Anuluj
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={handleDeleteConfirm}
                      isLoading={isDeleting}
                    >
                      Usuń
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
