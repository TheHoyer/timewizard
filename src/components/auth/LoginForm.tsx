'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { FormError } from '@/components/ui/FormFieldError'
import { loginAction, AuthState } from '@/lib/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" size="lg" isLoading={pending}>
      {pending ? 'Logowanie...' : 'Zaloguj się'}
    </Button>
  )
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const initialState: AuthState = {}
  const [state, formAction] = useActionState(loginAction, initialState)

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">⏳</span>
          </div>
          <span className="font-bold text-2xl text-slate-900 dark:text-white">TimeWizard</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Zaloguj się</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mt-2">
          Witaj z powrotem! Zaloguj się do swojego konta.
        </p>

        {/* Error messages */}
        {state.error && (
          <div className="mt-4">
            <FormError message={state.error} />
          </div>
        )}

        {/* Email/Password Form */}
        <form action={formAction} className="space-y-4 mt-8">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="twoj@email.pl"
            error={state.fieldErrors?.email}
            autoComplete="email"
            required
          />

          <Input
            name="password"
            type="password"
            label="Hasło"
            placeholder="••••••••"
            error={state.fieldErrors?.password}
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">Zapamiętaj mnie</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
            >
              Zapomniałeś hasła?
            </Link>
          </div>

          <SubmitButton />
        </form>
      </div>

      <p className="text-center mt-6 text-slate-600 dark:text-slate-400">
        Nie masz konta?{' '}
        <Link href="/register" className="text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300">
          Zarejestruj się
        </Link>
      </p>
    </div>
  )
}
