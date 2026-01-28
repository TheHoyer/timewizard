'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from './Button'
import { cn } from '@/lib/utils/cn'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Potwierdź',
  cancelText = 'Anuluj',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const variantConfig = {
    danger: {
      icon: TrashIcon,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonVariant: 'danger' as const,
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      buttonVariant: 'primary' as const,
    },
    info: {
      icon: ExclamationTriangleIcon,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonVariant: 'primary' as const,
    },
  }

  const config = variantConfig[variant]
  const Icon = config.icon

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn('flex-shrink-0 p-3 rounded-full', config.iconBg)}>
                    <Icon className={cn('w-6 h-6', config.iconColor)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                      {title}
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {description}
                    </p>
                  </div>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant={config.buttonVariant}
                    onClick={onConfirm}
                    isLoading={isLoading}
                  >
                    {confirmText}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
