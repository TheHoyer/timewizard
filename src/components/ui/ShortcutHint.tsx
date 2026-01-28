'use client'

import { formatShortcut } from '@/hooks/useKeyboardShortcuts'

type KeyboardShortcut = {
  key: string
  ctrl?: boolean
  meta?: boolean
  alt?: boolean
  shift?: boolean
}

interface ShortcutHintProps {
  shortcut: KeyboardShortcut
  className?: string
}

export function ShortcutHint({ shortcut, className = '' }: ShortcutHintProps) {
  return (
    <kbd className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-600 ${className}`}>
      {formatShortcut(shortcut)}
    </kbd>
  )
}
