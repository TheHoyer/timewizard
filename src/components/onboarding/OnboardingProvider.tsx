'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { WelcomeScreen } from './WelcomeScreen'
import { GuidedTour } from './GuidedTour'
import { InteractiveTutorial } from './InteractiveTutorial'
import { OnboardingTooltipProvider, ONBOARDING_TOOLTIPS } from './OnboardingTooltip'
import { getOnboardingStatus } from '@/lib/actions/onboarding'

interface OnboardingState {
  onboardingCompleted: boolean
  onboardingStep: number
  userGoal: string | null
  isFirstLogin: boolean
  showTooltips: boolean
  tooltipsShown: string[]
}

interface OnboardingContextType {
  state: OnboardingState | null
  refreshState: () => Promise<void>
  startTutorial: () => void
}

const OnboardingContext = createContext<OnboardingContextType>({
  state: null,
  refreshState: async () => {},
  startTutorial: () => {},
})

export function useOnboarding() {
  return useContext(OnboardingContext)
}

interface OnboardingProviderProps {
  children: ReactNode
  userName?: string | null
}

export function OnboardingProvider({ children, userName }: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'welcome' | 'tour' | 'interactive' | 'done'>('done')

  const fetchState = async () => {
    const result = await getOnboardingStatus()
    if (result.success && result.data) {
      setState(result.data)
      
      // Determine which view to show
      if (!result.data.onboardingCompleted) {
        if (result.data.onboardingStep === 0) {
          setCurrentView('welcome')
        } else if (result.data.onboardingStep === 1) {
          setCurrentView('tour')
        } else {
          setCurrentView('done')
        }
      } else {
        setCurrentView('done')
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchState()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const handleWelcomeComplete = () => {
    // After welcome screen, show guided tour
    setCurrentView('tour')
    fetchState()
  }

  const handleTourComplete = () => {
    // After guided tour, show interactive tutorial
    setCurrentView('interactive')
    fetchState()
  }

  const handleInteractiveTutorialComplete = () => {
    setCurrentView('done')
    fetchState()
  }

  // Function to start tutorial manually (e.g., from settings)
  const startTutorial = () => {
    setCurrentView('interactive')
  }

  if (isLoading) {
    return <>{children}</>
  }

  return (
    <OnboardingContext.Provider value={{ state, refreshState: fetchState, startTutorial }}>
      {/* Welcome Screen */}
      {currentView === 'welcome' && (
        <WelcomeScreen
          userName={userName}
          onComplete={handleWelcomeComplete}
        />
      )}

      {/* Guided Tour (generating content) */}
      {currentView === 'tour' && state && (
        <GuidedTour
          userGoal={state.userGoal}
          onComplete={handleTourComplete}
        />
      )}

      {/* Main content */}
      {(currentView === 'done' || currentView === 'interactive') && (
        <>
          {children}
          
          {/* Interactive Tutorial overlay */}
          {currentView === 'interactive' && (
            <InteractiveTutorial
              onComplete={handleInteractiveTutorialComplete}
              onSkip={handleInteractiveTutorialComplete}
            />
          )}
          
          {/* Tooltips overlay */}
          {state && state.showTooltips && currentView === 'done' && (
            <OnboardingTooltipProvider
              tooltips={ONBOARDING_TOOLTIPS}
              shownTooltips={state.tooltipsShown}
              showTooltips={state.showTooltips}
            />
          )}
        </>
      )}
    </OnboardingContext.Provider>
  )
}
