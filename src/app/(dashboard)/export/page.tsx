'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { exportTasks } from '@/lib/actions/tasks'
import {
  DocumentArrowDownIcon,
  TableCellsIcon,
  CodeBracketIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

export default function ExportPage() {
  const { success: showSuccess, error: showError } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv'>('json')

  const handleExport = async () => {
    setIsExporting(true)
    const result = await exportTasks(selectedFormat)
    setIsExporting(false)

    if (result.success && result.data) {
      
      const blob = new Blob([result.data], {
        type: selectedFormat === 'json' ? 'application/json' : 'text/csv',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `timewizard-export-${new Date().toISOString().split('T')[0]}.${selectedFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showSuccess('Eksport zakończony', 'Plik został pobrany')
    } else {
      showError('Błąd', result.error || 'Nie udało się wyeksportować danych')
    }
  }

  const formats = [
    {
      id: 'json' as const,
      name: 'JSON',
      description: 'Format strukturalny, idealny do backupu i importu',
      icon: CodeBracketIcon,
    },
    {
      id: 'csv' as const,
      name: 'CSV',
      description: 'Format tabelaryczny, kompatybilny z Excel i Google Sheets',
      icon: TableCellsIcon,
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Eksport danych</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Pobierz kopię swoich zadań w wybranym formacie
        </p>
      </div>

      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Wybierz format
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formats.map((format) => (
            <motion.button
              key={format.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFormat(format.id)}
              className={cn(
                'relative p-6 rounded-xl border-2 text-left transition-colors',
                selectedFormat === format.id
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300 dark:hover:border-violet-700'
              )}
            >
              {selectedFormat === format.id && (
                <div className="absolute top-3 right-3">
                  <CheckIcon className="w-5 h-5 text-violet-500" />
                </div>
              )}
              <format.icon className={cn(
                'w-8 h-8 mb-3',
                selectedFormat === format.id
                  ? 'text-violet-500'
                  : 'text-slate-400 dark:text-slate-500'
              )} />
              <h3 className={cn(
                'font-semibold text-lg',
                selectedFormat === format.id
                  ? 'text-violet-900 dark:text-violet-300'
                  : 'text-slate-900 dark:text-white'
              )}>
                {format.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {format.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
        <h3 className="font-medium text-slate-900 dark:text-white mb-2">
          Eksport zawiera:
        </h3>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>• Wszystkie aktywne zadania</li>
          <li>• Informacje o kategoriach</li>
          <li>• Podzadania (subtasks)</li>
          <li>• Statusy i priorytety</li>
          <li>• Daty utworzenia i ukończenia</li>
        </ul>
      </div>

      
      <Button
        onClick={handleExport}
        isLoading={isExporting}
        size="lg"
        className="w-full gap-2"
      >
        <DocumentArrowDownIcon className="w-5 h-5" />
        Pobierz eksport ({selectedFormat.toUpperCase()})
      </Button>
    </div>
  )
}
