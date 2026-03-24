'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { CategoryModal } from '@/components/tasks/CategoryModal'
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'
import { Category } from '@prisma/client'

interface CommandPaletteContextType {
  openCommandPalette: () => void
  closeCommandPalette: () => void
  openAddTask: () => void
  openAddCategory: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null)

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  }
  return context
}

interface CommandPaletteProviderProps {
  children: ReactNode
  categories?: Category[]
}

export function CommandPaletteProvider({ children, categories = [] }: CommandPaletteProviderProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  
  useKeyboardShortcuts([
    {
      ...KEYBOARD_SHORTCUTS.SEARCH,
      action: () => setIsCommandPaletteOpen(true),
    },
    {
      ...KEYBOARD_SHORTCUTS.NEW_TASK,
      action: () => setIsAddTaskOpen(true),
    },
  ])

  const value: CommandPaletteContextType = {
    openCommandPalette: () => setIsCommandPaletteOpen(true),
    closeCommandPalette: () => setIsCommandPaletteOpen(false),
    openAddTask: () => setIsAddTaskOpen(true),
    openAddCategory: () => setIsCategoryModalOpen(true),
  }

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewTask={() => setIsAddTaskOpen(true)}
        onNewCategory={() => setIsCategoryModalOpen(true)}
      />
      
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        categories={categories}
      />
      
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </CommandPaletteContext.Provider>
  )
}
