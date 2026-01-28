import { Suspense } from 'react'
import { LoginForm } from '@/components/auth'

export const metadata = {
  title: 'Zaloguj się | TimeWizard',
  description: 'Zaloguj się do TimeWizard i zacznij efektywnie planować swój czas.',
}

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8 mx-auto w-40" />
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-4 mx-auto w-32" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-8 mx-auto w-48" />
        <div className="space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20 px-4">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
