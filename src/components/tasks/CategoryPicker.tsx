'use client'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, TagIcon, PlusIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { Category } from '@prisma/client'

interface CategoryPickerProps {
  categories: Category[]
  value: string | null
  onChange: (categoryId: string | null) => void
  onCreateNew?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function CategoryPicker({
  categories,
  value,
  onChange,
  onCreateNew,
  disabled = false,
  placeholder = 'Wybierz kategorię',
  className,
}: CategoryPickerProps) {
  const selectedCategory = categories.find((c) => c.id === value) || null

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={cn('relative', className)}>
        <Listbox.Button
          className={cn(
            'relative w-full cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600',
            'bg-white dark:bg-slate-800 py-2.5 pl-3 pr-10 text-left',
            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          <span className="flex items-center gap-2">
            {selectedCategory ? (
              <>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <span className="block truncate text-slate-900 dark:text-slate-100 font-medium">
                  {selectedCategory.name}
                </span>
              </>
            ) : (
              <>
                <TagIcon className="w-4 h-4 text-slate-400" />
                <span className="block truncate text-slate-500 dark:text-slate-400">
                  {placeholder}
                </span>
              </>
            )}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={cn(
              'absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg',
              'bg-white dark:bg-slate-800 py-1 shadow-lg',
              'border border-slate-200 dark:border-slate-700',
              'focus:outline-none'
            )}
          >
            
            <Listbox.Option
              value={null}
              className={({ active }) =>
                cn(
                  'relative cursor-pointer select-none py-2 pl-10 pr-4',
                  active
                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100'
                    : 'text-slate-700 dark:text-slate-300'
                )
              }
            >
              {({ selected }) => (
                <>
                  <span className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}>
                    Bez kategorii
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-violet-600 dark:text-violet-400">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </Listbox.Option>

            
            {categories.map((category) => (
              <Listbox.Option
                key={category.id}
                value={category.id}
                className={({ active }) =>
                  cn(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4',
                    active
                      ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100'
                      : 'text-slate-700 dark:text-slate-300'
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}>
                        {category.name}
                      </span>
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-violet-600 dark:text-violet-400">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}

            
            {onCreateNew && (
              <>
                <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    onCreateNew()
                  }}
                  className={cn(
                    'relative w-full cursor-pointer select-none py-2 pl-10 pr-4 text-left',
                    'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30'
                  )}
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <PlusIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-medium">Utwórz nową kategorię</span>
                </button>
              </>
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
