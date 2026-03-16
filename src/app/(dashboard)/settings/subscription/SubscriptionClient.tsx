'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BuildingOffice2Icon,
  StarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

interface SubscriptionClientProps {
  currentPlan: string
  usage: {
    tasks: number
    categories: number
  }
  limits: {
    maxTasks: number
    maxCategories: number
  }
  subscription: {
    customerId: string | null
    subscriptionId: string | null
    priceId: string | null
    currentPeriodEnd: Date | null
  }
}

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    description: 'Idealny na start',
    price: 0,
    priceYearly: 0,
    icon: SparklesIcon,
    color: 'from-slate-500 to-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
    features: [
      '50 zadań',
      '5 kategorii',
      'Podstawowe statystyki',
      'Timer Pomodoro',
      'Widok Kanban',
      'Eksport danych (JSON)',
    ],
    limitations: [
      'Brak integracji z kalendarzem',
      'Brak zaawansowanych raportów',
      'Brak priorytetowego wsparcia',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'Dla power userów',
    price: 29,
    priceYearly: 290,
    popular: true,
    icon: RocketLaunchIcon,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    features: [
      '500 zadań',
      '20 kategorii',
      'Wszystko z Free',
      'Integracja z Google Calendar',
      'Zaawansowane raporty',
      'Szablony zadań',
      'Powiadomienia push',
      'Eksport PDF/CSV',
      'Priorytetowe wsparcie',
    ],
    limitations: [],
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    description: 'Dla zespołów',
    price: 79,
    priceYearly: 790,
    icon: BuildingOffice2Icon,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    features: [
      'Nielimitowane zadania',
      'Nielimitowane kategorie',
      'Wszystko z Pro',
      'Współdzielone workspace\'y',
      'Zarządzanie zespołem',
      'Integracja Slack/Teams',
      'API dostęp',
      'Dedykowany opiekun',
      'SLA 99.9%',
    ],
    limitations: [],
  },
]

export function SubscriptionClient({
  currentPlan,
  usage,
  limits,
}: SubscriptionClientProps) {
  const { success: showSuccess } = useToast()
  const [billingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    setIsLoading(planId)
    
    // Symulacja - w przyszłości połączenie ze Stripe
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    showSuccess(
      'Wkrótce dostępne!',
      'Płatności zostaną uruchomione w kolejnej aktualizacji. Dziękujemy za zainteresowanie!'
    )
    
    setIsLoading(null)
  }

  const usagePercentage = {
    tasks: limits.maxTasks === -1 ? 0 : Math.round((usage.tasks / limits.maxTasks) * 100),
    categories: limits.maxCategories === -1 ? 0 : Math.round((usage.categories / limits.maxCategories) * 100),
  }

  return (
    <div className="space-y-8">
      {/* Current Plan Overview */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full translate-y-24 -translate-x-24 blur-2xl" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Twój aktualny plan</p>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                ⭐
                UNIFIED
              </h2>
              <p className="text-white/70 mt-2 text-sm">
                Tymczasowo wszyscy użytkownicy korzystają z tego samego zestawu funkcji.
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Zadania</span>
                <span className="font-semibold">
                  {usage.tasks} / {limits.maxTasks === -1 ? '∞' : limits.maxTasks}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    usagePercentage.tasks > 80 ? 'bg-red-400' : 'bg-white'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(usagePercentage.tasks, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Kategorie</span>
                <span className="font-semibold">
                  {usage.categories} / {limits.maxCategories === -1 ? '∞' : limits.maxCategories}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    usagePercentage.categories > 80 ? 'bg-red-400' : 'bg-white'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(usagePercentage.categories, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
        Cennik i rozliczenia są obecnie wyłączone. Stripe zostanie podpięty w kolejnej iteracji.
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, index) => {
          const isCurrentPlan = plan.id === currentPlan
          const Icon = plan.icon
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.price
          const monthlyPrice = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.price

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative rounded-2xl border-2 p-6 transition-all',
                plan.bgColor,
                isCurrentPlan
                  ? 'border-violet-500 dark:border-violet-400 ring-4 ring-violet-100 dark:ring-violet-900/30'
                  : plan.borderColor,
                plan.popular && !isCurrentPlan && 'md:-translate-y-2'
              )}
            >
              {/* Popular Badge */}
              {plan.popular && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
                    <StarIcon className="w-3 h-3" />
                    Najpopularniejszy
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-violet-600 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" />
                    Twój plan
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <div className={cn(
                  'inline-flex p-3 rounded-xl bg-gradient-to-br mb-4',
                  plan.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {price === 0 ? 'Gratis' : `${monthlyPrice} zł`}
                  </span>
                  {price > 0 && (
                    <span className="text-slate-500 dark:text-slate-400 mb-1">/mies.</span>
                  )}
                </div>
                {billingCycle === 'yearly' && price > 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {price} zł rozliczane rocznie
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <li key={`limit-${i}`} className="flex items-start gap-2 opacity-50">
                    <span className="w-5 h-5 flex items-center justify-center text-slate-400 flex-shrink-0">
                      ✕
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 line-through">
                      {limitation}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {isCurrentPlan || currentPlan === 'UNIFIED' ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed"
                >
                  Aktualny plan
                </button>
              ) : (
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isLoading === plan.id}
                  className={cn(
                    'w-full py-3 gap-2',
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
                      : ''
                  )}
                  variant={plan.popular ? 'primary' : 'outline'}
                >
                  {isLoading === plan.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Przetwarzanie...
                    </>
                  ) : plan.id === 'FREE' ? (
                    'Wyłączone'
                  ) : (
                    'Wyłączone'
                  )}
                </Button>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* FAQ / Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Informacje o planach
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Aktualnie wszyscy użytkownicy mają ten sam zakres funkcji</li>
              <li>• Limity planów i płatności są tymczasowo nieaktywne</li>
              <li>• Integracja Stripe zostanie udostępniona w osobnym wdrożeniu</li>
              <li>• Nie musisz podejmować żadnych działań po swojej stronie</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
