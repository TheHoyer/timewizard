'use client'

import { useEffect, useCallback } from 'react'

type KeyboardShortcut = {
  key: string
  ctrl?: boolean
  meta?: boolean
  alt?: boolean
  shift?: boolean
  description: string
  action: () => void
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey

        
        const modifierMatch = shortcut.ctrl || shortcut.meta
          ? (event.ctrlKey || event.metaKey)
          : (!event.ctrlKey && !event.metaKey)

        if (keyMatch && modifierMatch && altMatch && shiftMatch) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}


export const KEYBOARD_SHORTCUTS = {
  NEW_TASK: { key: 'n', ctrl: true, description: 'Nowe zadanie' },
  SEARCH: { key: 'k', ctrl: true, description: 'Szukaj' },
  TOGGLE_SIDEBAR: { key: 'b', ctrl: true, description: 'Przełącz sidebar' },
  TOGGLE_THEME: { key: 't', ctrl: true, shift: true, description: 'Przełącz motyw' },
  ESCAPE: { key: 'Escape', description: 'Zamknij modal' },
  SAVE: { key: 's', ctrl: true, description: 'Zapisz' },
  DASHBOARD: { key: '1', ctrl: true, description: 'Idź do Dashboard' },
  TASKS: { key: '2', ctrl: true, description: 'Idź do Zadań' },
  CATEGORIES: { key: '3', ctrl: true, description: 'Idź do Kategorii' },
} as const


export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action' | 'description'>) {
  const isMac = typeof window !== 'undefined' && navigator.platform.includes('Mac')
  const parts: string[] = []

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt')
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift')
  }

  
  const keyDisplay = shortcut.key === 'Escape' ? 'Esc' : shortcut.key.toUpperCase()
  parts.push(keyDisplay)

  return parts.join(isMac ? '' : '+')
}
