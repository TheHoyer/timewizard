'use client'

import { Fragment, useState, useEffect, useActionState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, SwatchIcon, FaceSmileIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui'
import { createCategory, updateCategory, CategoryFormState } from '@/lib/actions/categories'
import { Category } from '@prisma/client'
import { useToast } from '@/components/ui/Toast'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null 
}

const PRESET_COLORS = [
  '#4F46E5', 
  '#7C3AED', 
  '#EC4899', 
  '#EF4444', 
  '#F97316', 
  '#EAB308', 
  '#22C55E', 
  '#14B8A6', 
  '#06B6D4', 
  '#3B82F6', 
  '#6366F1', 
  '#8B5CF6', 
]

const PRESET_EMOJIS = [
  '📁', '📂', '💼', '🏠', '🏢', '🎯', '⭐', '💡',
  '📚', '📝', '✏️', '🎨', '🎮', '🎬', '🎵', '🎸',
  '💪', '🏃', '🧘', '🍎', '🥗', '💊', '🏥', '❤️',
  '💰', '💵', '📈', '📊', '🛒', '🛍️', '✈️', '🚗',
  '👨‍💻', '👩‍💼', '👥', '📞', '📧', '💬', '🔔', '⏰',
  '🔥', '⚡', '✨', '🎉', '🏆', '🎁', '📅', '🗓️',
]

const initialState: CategoryFormState = {}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const { success: showSuccess, error: showError } = useToast()
  const isEditMode = !!category
  
  const [state, formAction, isPending] = useActionState(
    isEditMode ? updateCategory : createCategory,
    initialState
  )
  
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icon, setIcon] = useState<string>('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const initializeForm = () => {
    if (category) {
      setName(category.name)
      setColor(category.color)
      setIcon(category.icon || '')
    } else {
      setName('')
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)])
      setIcon('')
    }
    setShowEmojiPicker(false)
  }

  // Handle success/error
  useEffect(() => {
    if (state.success) {
      showSuccess(
        isEditMode ? 'Kategoria zaktualizowana' : 'Kategoria utworzona',
        `"${state.data?.name}" została ${isEditMode ? 'zapisana' : 'dodana'}`
      )
      onClose()
    } else if (state.error) {
      showError('Błąd', state.error)
    }
  }, [state, isEditMode, showSuccess, showError, onClose])

  const handleSubmit = (formData: FormData) => {
    if (isEditMode && category) {
      formData.set('id', category.id)
    }
    formData.set('name', name)
    formData.set('color', color)
    if (icon) {
      formData.set('icon', icon)
    }
    formAction(formData)
  }

  return (
    <Transition appear show={isOpen} as={Fragment} beforeEnter={initializeForm}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl transition-all">
                
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                    {isEditMode ? 'Edytuj kategorię' : 'Nowa kategoria'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                
                <form action={handleSubmit} className="space-y-5">
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      {icon || <SwatchIcon className="w-5 h-5" style={{ color }} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {name || 'Nazwa kategorii'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Podgląd</p>
                    </div>
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Nazwa
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="np. Praca, Osobiste, Zdrowie..."
                      required
                      maxLength={50}
                      className={cn(
                        'w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
                        'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                        'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                      )}
                    />
                    {state.fieldErrors?.name && (
                      <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name[0]}</p>
                    )}
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Ikona (emoji)
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={cn(
                          'w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center text-2xl transition-all',
                          icon 
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-violet-400'
                        )}
                      >
                        {icon || <FaceSmileIcon className="w-6 h-6 text-slate-400" />}
                      </button>
                      {icon && (
                        <button
                          type="button"
                          onClick={() => setIcon('')}
                          className="text-sm text-slate-500 hover:text-red-500"
                        >
                          Usuń ikonę
                        </button>
                      )}
                    </div>
                    
                    {showEmojiPicker && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex flex-wrap gap-1">
                          {PRESET_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setIcon(emoji)
                                setShowEmojiPicker(false)
                              }}
                              className={cn(
                                'w-9 h-9 rounded-lg text-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors',
                                icon === emoji && 'bg-violet-100 dark:bg-violet-900/30'
                              )}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Kolor
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={cn(
                            'w-8 h-8 rounded-lg transition-all',
                            color === c
                              ? 'ring-2 ring-offset-2 ring-violet-500 dark:ring-offset-slate-800 scale-110'
                              : 'hover:scale-105'
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    
                    
                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-sm text-slate-500 dark:text-slate-400">
                        Własny kolor:
                      </label>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => {
                          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                            setColor(e.target.value)
                          }
                        }}
                        placeholder="#000000"
                        className={cn(
                          'w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-600',
                          'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                          'text-sm font-mono',
                          'focus:outline-none focus:ring-2 focus:ring-violet-500'
                        )}
                      />
                    </div>
                    {state.fieldErrors?.color && (
                      <p className="mt-1 text-sm text-red-600">{state.fieldErrors.color[0]}</p>
                    )}
                  </div>

                  
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
                      {isEditMode ? 'Zapisz' : 'Utwórz'}
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
