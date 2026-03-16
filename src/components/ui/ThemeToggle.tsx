'use client'

import { useTheme } from './ThemeProvider'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const themes = [
    { value: 'light' as const, label: 'Jasny', icon: SunIcon },
    { value: 'dark' as const, label: 'Ciemny', icon: MoonIcon },
    { value: 'system' as const, label: 'Systemowy', icon: ComputerDesktopIcon },
  ]

  return (
    <div className="relative" ref={menuRef}>
      {/* Simple toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(!showMenu)
        }}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        title="Kliknij aby zmienić motyw, prawy klik dla więcej opcji"
      >
        <motion.div
          initial={false}
          animate={{ scale: [1, 0.8, 1] }}
          transition={{ duration: 0.3 }}
        >
          {resolvedTheme === 'dark' ? (
            <MoonIcon className="w-5 h-5 text-violet-400" />
          ) : (
            <SunIcon className="w-5 h-5 text-amber-500" />
          )}
        </motion.div>
      </motion.button>

      {/* Dropdown menu */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50"
        >
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value)
                setShowMenu(false)
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors
                ${theme === value ? 'text-violet-600 dark:text-violet-400 font-medium' : 'text-slate-700 dark:text-slate-300'}
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
              {theme === value && (
                <span className="ml-auto text-violet-600 dark:text-violet-400">✓</span>
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
