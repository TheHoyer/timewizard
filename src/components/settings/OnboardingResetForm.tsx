'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPathIcon, SparklesIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { resetOnboarding } from '@/lib/actions/onboarding'
import { useOnboarding } from '@/components/onboarding/OnboardingProvider'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

export function OnboardingResetForm() {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const { startTutorial } = useOnboarding()
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = async () => {
    setIsResetting(true)
    const result = await resetOnboarding()
    
    if (result.success) {
      showSuccess('Onboarding zresetowany', 'Odśwież stronę, aby zobaczyć wprowadzenie ponownie')
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      showError('Błąd', result.error || 'Nie udało się zresetować onboardingu')
    }
    setIsResetting(false)
  }

  const handleStartTutorial = () => {
    
    router.push('/dashboard')
    
    setTimeout(() => {
      startTutorial()
    }, 300)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
          <SparklesIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Wprowadzenie i Tutorial
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-4">
            Uruchom interaktywny tutorial lub ponownie zobacz pełne wprowadzenie do aplikacji.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartTutorial}
              className="gap-2"
            >
              <AcademicCapIcon className="w-4 h-4" />
              Uruchom tutorial
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              isLoading={isResetting}
              className="gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Resetuj cały onboarding
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
