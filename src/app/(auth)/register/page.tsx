import { RegisterForm } from '@/components/auth'

export const metadata = {
  title: 'Utwórz konto | TimeWizard',
  description: 'Zarejestruj się w TimeWizard i zacznij efektywnie planować swój czas.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20 px-4 py-12">
      <RegisterForm />
    </div>
  )
}
