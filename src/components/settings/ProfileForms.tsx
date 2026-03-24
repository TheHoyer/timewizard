'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button, Input } from '@/components/ui'
import {
  updateProfileAction,
  changePasswordAction,
  deleteAccountAction,
  ProfileState,
} from '@/lib/actions/profile'


const TIMEZONES = [
  { value: 'Europe/Warsaw', label: 'Warszawa (CET/CEST)' },
  { value: 'Europe/London', label: 'Londyn (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paryż (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'America/New_York', label: 'Nowy Jork (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'Asia/Tokyo', label: 'Tokio (JST)' },
  { value: 'Asia/Singapore', label: 'Singapur (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC' },
]

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" isLoading={pending}>
      {pending ? pendingLabel : label}
    </Button>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="danger" isLoading={pending}>
      {pending ? 'Usuwanie...' : 'Usuń konto na zawsze'}
    </Button>
  )
}


export function ProfileForm({
  user,
}: {
  user: { name: string | null; email: string | null; timezone: string | null }
}) {
  const initialState: ProfileState = {}
  const [state, formAction] = useActionState(updateProfileAction, initialState)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Informacje o profilu</h2>

      {state.success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">Profil został zaktualizowany!</p>
        </div>
      )}

      {state.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          name="name"
          label="Imię"
          defaultValue={user.name || ''}
          error={state.fieldErrors?.name?.[0]}
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
          />
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Email nie może być zmieniony</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Strefa czasowa
          </label>
          <select
            name="timezone"
            defaultValue={user.timezone || 'Europe/Warsaw'}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800 focus:border-violet-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.timezone && (
            <p className="text-sm text-red-500 mt-1">{state.fieldErrors.timezone[0]}</p>
          )}
        </div>

        <div className="pt-4">
          <SubmitButton label="Zapisz zmiany" pendingLabel="Zapisywanie..." />
        </div>
      </form>
    </div>
  )
}


export function PasswordForm() {
  const initialState: ProfileState = {}
  const [state, formAction] = useActionState(changePasswordAction, initialState)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Zmień hasło</h2>

      {state.success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">Hasło zostało zmienione!</p>
        </div>
      )}

      {state.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          name="currentPassword"
          type="password"
          label="Aktualne hasło"
          error={state.fieldErrors?.currentPassword?.[0]}
          autoComplete="current-password"
          required
        />

        <Input
          name="newPassword"
          type="password"
          label="Nowe hasło"
          error={state.fieldErrors?.newPassword?.[0]}
          autoComplete="new-password"
          required
        />

        <Input
          name="confirmPassword"
          type="password"
          label="Potwierdź nowe hasło"
          error={state.fieldErrors?.confirmPassword?.[0]}
          autoComplete="new-password"
          required
        />

        <div className="pt-4">
          <SubmitButton label="Zmień hasło" pendingLabel="Zmienianie..." />
        </div>
      </form>
    </div>
  )
}


export function DeleteAccountForm() {
  const initialState: ProfileState = {}
  const [state, formAction] = useActionState(deleteAccountAction, initialState)

  
  if (state.success && typeof window !== 'undefined') {
    
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
      <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Strefa niebezpieczna</h2>
      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-4">
        Ta akcja jest nieodwracalna. Wszystkie Twoje dane zostaną usunięte.
      </p>

      {state.success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">
            Konto zostało usunięte. Zostaniesz wylogowany...
          </p>
          <script dangerouslySetInnerHTML={{ __html: 'setTimeout(() => window.location.href = "/", 2000)' }} />
        </div>
      )}

      {state.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Wpisz &quot;USUŃ MOJE KONTO&quot; aby potwierdzić
          </label>
          <input
            name="confirmation"
            type="text"
            placeholder="USUŃ MOJE KONTO"
            className="w-full px-4 py-3 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 focus:border-red-500"
          />
          {state.fieldErrors?.confirmation && (
            <p className="text-sm text-red-500 mt-1">{state.fieldErrors.confirmation[0]}</p>
          )}
        </div>

        <DeleteButton />
      </form>
    </div>
  )
}
