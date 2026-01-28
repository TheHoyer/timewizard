'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button, Input } from '@/components/ui'
import { FormError, FormSuccess } from '@/components/ui/FormFieldError'
import { registerAction, loginWithGoogle, loginWithGitHub, AuthState } from '@/lib/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" size="lg" isLoading={pending}>
      {pending ? 'Tworzenie konta...' : 'Utwórz konto'}
    </Button>
  )
}

function GoogleButton() {
  const { pending } = useFormStatus()

  return (
    <button
      formAction={loginWithGoogle}
      disabled={pending}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span className="text-slate-700 dark:text-slate-200 font-medium">Kontynuuj z Google</span>
    </button>
  )
}

function GitHubButton() {
  const { pending } = useFormStatus()

  return (
    <button
      formAction={loginWithGitHub}
      disabled={pending}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
    >
      <svg className="w-5 h-5 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
      <span className="text-slate-700 dark:text-slate-200 font-medium">Kontynuuj z GitHub</span>
    </button>
  )
}

export function RegisterForm() {
  const initialState: AuthState = {}
  const [state, formAction] = useActionState(registerAction, initialState)

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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Utwórz konto</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mt-2">
          Zacznij planować swój czas efektywniej.
        </p>

        {/* Error messages */}
        {state.error && !state.fieldErrors && (
          <div className="mt-4">
            <FormError message={state.error} />
          </div>
        )}

        {/* Success message */}
        {state.success && (
          <div className="mt-4">
            <FormSuccess message="Konto zostało utworzone! Za chwilę zostaniesz przekierowany..." />
          </div>
        )}

        {/* Social Login */}
        <form className="mt-8 space-y-3">
          <GoogleButton />
          <GitHubButton />
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">lub</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form action={formAction} className="space-y-4">
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
