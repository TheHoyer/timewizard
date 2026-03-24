import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProfileForm, PasswordForm, DeleteAccountForm, OnboardingResetForm } from '@/components/settings'

export const metadata = {
  title: 'Profil | TimeWizard',
  description: 'Zarządzaj swoim profilem i ustawieniami konta.',
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      password: true,
      timezone: true,
      plan: true,
      image: true,
      createdAt: true,
      accounts: {
        select: { provider: true },
      },
    },
  })

  if (!user) {
    redirect('/login')
  }

  const hasPassword = !!user.password

  return (
    <div className="space-y-6">
      
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/20">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm border border-white/20">
            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name || 'Użytkownik'}</h2>
            <p className="text-white/80">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                {user.plan === 'FREE' ? '🆓 Free' : user.plan === 'PRO' ? '⭐ Pro' : '🏢 Business'}
              </span>
              <span className="text-xs text-white/60">
                Dołączył {new Date(user.createdAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      
      {user.accounts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Połączone konta</h2>
          <div className="space-y-3">
            {user.accounts.map((account: { provider: string }) => (
              <div
                key={account.provider}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50"
              >
                <span className="text-slate-700 dark:text-slate-200 font-medium capitalize">
                  {account.provider}
                </span>
                <span className="ml-auto text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full font-medium">
                  ✓ Połączone
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      
      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          timezone: user.timezone,
        }}
      />

      
      {hasPassword && <PasswordForm />}

      
      <OnboardingResetForm />

      
      <DeleteAccountForm />
    </div>
  )
}
