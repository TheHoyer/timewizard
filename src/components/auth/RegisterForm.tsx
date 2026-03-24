'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button, Input } from '@/components/ui'
import { FormError, FormSuccess } from '@/components/ui/FormFieldError'
import { registerAction, AuthState } from '@/lib/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" size="lg" isLoading={pending}>
      {pending ? 'Tworzenie konta...' : 'Utwórz konto'}
    </Button>
  )
}

export function RegisterForm() {
  const initialState: AuthState = {}
  const [state, formAction] = useActionState(registerAction, initialState)

  return (
    <div className="w-full max-w-md">
      
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">⏳</span>
          </div>
          <span className="font-bold text-2xl text-slate-900 dark:text-white">TimeWizard</span>
        </Link>
      </div>

      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Utwórz konto</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mt-2">
          Zacznij planować swój czas efektywniej.
        </p>

        
        {state.error && !state.fieldErrors && (
          <div className="mt-4">
            <FormError message={state.error} />
          </div>
        )}

        
        {state.success && (
          <div className="mt-4">
            <FormSuccess message="Konto zostało utworzone! Za chwilę zostaniesz przekierowany..." />
          </div>
        )}

        
        <form action={formAction} className="space-y-4 mt-8">
          <Input
            name="name"
            type="text"
            label="Imię"
            placeholder="Jan"
            error={state.fieldErrors?.name}
            autoComplete="given-name"
            required
          />

          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="twoj@email.pl"
            error={state.fieldErrors?.email}
            autoComplete="email"
            required
          />

          <div>
            <Input
              name="password"
              type="password"
              label="Hasło"
              placeholder="Min. 8 znaków"
              error={state.fieldErrors?.password}
              autoComplete="new-password"
              required
            />
            {!state.fieldErrors?.password && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Min. 8 znaków, w tym wielka litera, mała litera i cyfra
              </p>
            )}
          </div>

          <Input
            name="confirmPassword"
            type="password"
            label="Potwierdź hasło"
            placeholder="Wpisz hasło ponownie"
            error={state.fieldErrors?.confirmPassword}
            autoComplete="new-password"
            required
          />

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="terms"
              id="terms"
              required
              className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-violet-600 focus:ring-violet-500 mt-1"
            />
            <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-300">
              Akceptuję{' '}
              <Link href="/terms" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">
                Regulamin
              </Link>{' '}
              i{' '}
              <Link href="/privacy" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">
                Politykę Prywatności
              </Link>
            </label>
          </div>

          <SubmitButton />
        </form>
      </div>

      <p className="text-center mt-6 text-slate-600 dark:text-slate-400">
        Masz już konto?{' '}
        <Link href="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300">
          Zaloguj się
        </Link>
      </p>
    </div>
  )
}
