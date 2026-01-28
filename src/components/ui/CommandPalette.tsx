'use client'

import { Fragment, useState, useEffect, useCallback, useMemo } from 'react'
import { Dialog, Transition, Combobox } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  Cog6ToothIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  TagIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { useTheme } from './ThemeProvider'
import { signOut } from 'next-auth/react'

type CommandAction = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  section: 'navigation' | 'actions' | 'settings'
  action: () => void | Promise<void>
  keywords?: string[]
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNewTask?: () => void
  onNewCategory?: () => void
}

export function CommandPalette({ isOpen, onClose, onNewTask, onNewCategory }: CommandPaletteProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [query, setQuery] = useState('')

  const commands: CommandAction[] = useMemo(() => [
    // Navigation
    {
      id: 'dashboard',
      name: 'Idź do Dashboard',
      icon: HomeIcon,
      shortcut: '⌘1',
      section: 'navigation',
      action: () => router.push('/dashboard'),
      keywords: ['start', 'główna', 'home'],
    },
    {
      id: 'tasks',
      name: 'Idź do Zadań',
      icon: ClipboardDocumentListIcon,
      shortcut: '⌘2',
      section: 'navigation',
      action: () => router.push('/tasks'),
      keywords: ['lista', 'todo'],
    },
    {
      id: 'categories',
      name: 'Idź do Kategorii',
      icon: FolderIcon,
      shortcut: '⌘3',
      section: 'navigation',
      action: () => router.push('/categories'),
      keywords: ['foldery', 'grupy'],
    },
    {
      id: 'timeline',
      name: 'Idź do Timeline',
      icon: CalendarIcon,
      section: 'navigation',
      action: () => router.push('/timeline'),
      keywords: ['oś czasu', 'kalendarz', 'harmonogram'],
    },
    {
      id: 'stats',
      name: 'Idź do Statystyk',
      icon: ChartBarIcon,
      section: 'navigation',
      action: () => router.push('/stats'),
      keywords: ['produktywność', 'wykresy', 'analiza'],
    },
    {
      id: 'settings',
      name: 'Idź do Ustawień',
      icon: Cog6ToothIcon,
      section: 'navigation',
      action: () => router.push('/settings'),
      keywords: ['opcje', 'konfiguracja'],
    },
    {
      id: 'profile',
      name: 'Idź do Profilu',
      icon: UserIcon,
      section: 'navigation',
      action: () => router.push('/settings/profile'),
      keywords: ['konto', 'użytkownik'],
    },
    
    // Actions
    {
      id: 'new-task',
      name: 'Nowe zadanie',
      icon: PlusIcon,
      shortcut: '⌘N',
      section: 'actions',
      action: () => onNewTask?.(),
      keywords: ['utwórz', 'dodaj', 'create'],
    },
    {
      id: 'new-category',
      name: 'Nowa kategoria',
      icon: TagIcon,
      section: 'actions',
      action: () => onNewCategory?.(),
      keywords: ['utwórz', 'dodaj', 'folder'],
    },
    {
      id: 'export',
      name: 'Eksportuj dane',
      icon: DocumentArrowDownIcon,
      section: 'actions',
      action: () => router.push('/export'),
      keywords: ['pobierz', 'csv', 'json', 'backup'],
    },
    
    // Settings
    {
      id: 'toggle-theme',
      name: theme === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw',
      icon: theme === 'dark' ? SunIcon : MoonIcon,
      shortcut: '⌘⇧T',
      section: 'settings',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      keywords: ['tryb', 'ciemny', 'jasny', 'dark', 'light'],
    },
    {
      id: 'logout',
      name: 'Wyloguj się',
      icon: ArrowRightOnRectangleIcon,
      section: 'settings',
      action: () => signOut({ callbackUrl: '/login' }),
      keywords: ['wyjdź', 'konto'],
    },
  ], [router, theme, setTheme, onNewTask, onNewCategory])

  const filteredCommands = useMemo(() => {
    if (!query) return commands
    
    const normalizedQuery = query.toLowerCase().trim()
    return commands.filter((command) => {
      const nameMatch = command.name.toLowerCase().includes(normalizedQuery)
      const keywordsMatch = command.keywords?.some(k => k.toLowerCase().includes(normalizedQuery))
      return nameMatch || keywordsMatch
    })
  }, [commands, query])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {
      navigation: [],
      actions: [],
      settings: [],
    }
    
    filteredCommands.forEach((command) => {
      groups[command.section].push(command)
    })
    
    return groups
  }, [filteredCommands])

  const handleSelect = useCallback((command: CommandAction | null) => {
    if (command) {
      command.action()
      onClose()
    }
  }, [onClose])

  // Reset query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
    }
  }, [isOpen])

  const sectionLabels: Record<string, string> = {
    navigation: 'Nawigacja',
    actions: 'Akcje',
    settings: 'Ustawienia',
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black/5 transition-all">
              <Combobox onChange={handleSelect}>
                {/* Search Input */}
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Combobox.Input
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 text-sm"
                    placeholder="Wpisz komendę lub szukaj..."
                    onChange={(event) => setQuery(event.target.value)}
                    autoComplete="off"
                  />
                  <div className="absolute right-4 top-3 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                    ESC
                  </div>
                </div>

                {/* Results */}
                {filteredCommands.length > 0 && (
                  <Combobox.Options
                    static
                    className="max-h-80 scroll-py-2 divide-y divide-slate-100 dark:divide-slate-700 overflow-y-auto"
                  >
                    {Object.entries(groupedCommands).map(([section, sectionCommands]) => (
                      sectionCommands.length > 0 && (
                        <li key={section} className="p-2">
                          <h2 className="mb-2 mt-1 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {sectionLabels[section]}
                          </h2>
                          <ul>
                            {sectionCommands.map((command) => (
                              <Combobox.Option
                                key={command.id}
                                value={command}
                                className={({ active }) =>
                                  cn(
                                    'flex cursor-pointer select-none items-center rounded-lg px-3 py-2',
                                    active ? 'bg-violet-500 text-white' : 'text-slate-700 dark:text-slate-300'
                                  )
                                }
                              >
                                {({ active }) => (
                                  <>
                                    <command.icon
                                      className={cn(
                                        'h-5 w-5 flex-shrink-0',
                                        active ? 'text-white' : 'text-slate-400'
                                      )}
                                    />
                                    <span className="ml-3 flex-auto truncate">{command.name}</span>
                                    {command.shortcut && (
                                      <span
                                        className={cn(
                                          'ml-3 flex-none text-xs font-medium',
                                          active ? 'text-violet-200' : 'text-slate-400'
                                        )}
                                      >
                                        {command.shortcut}
                                      </span>
                                    )}
                                  </>
                                )}
                              </Combobox.Option>
                            ))}
                          </ul>
                        </li>
                      )
                    ))}
                  </Combobox.Options>
                )}

                {/* Empty state */}
                {query && filteredCommands.length === 0 && (
                  <div className="px-6 py-14 text-center sm:px-14">
                    <MagnifyingGlassIcon className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-4 text-sm text-slate-900 dark:text-white">
                      Nie znaleziono komend dla &quot;{query}&quot;
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Spróbuj użyć innych słów kluczowych
                    </p>
                  </div>
                )}

                {/* Footer hint */}
                <div className="flex flex-wrap items-center bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 text-xs text-slate-500">
                  <span className="mr-4">
                    <kbd className="rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 font-medium">↑↓</kbd>
                    <span className="ml-1">nawiguj</span>
                  </span>
                  <span className="mr-4">
                    <kbd className="rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 font-medium">↵</kbd>
                    <span className="ml-1">wybierz</span>
                  </span>
                  <span>
                    <kbd className="rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 font-medium">ESC</kbd>
                    <span className="ml-1">zamknij</span>
                  </span>
                </div>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
