import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllAchievements, getUserStats } from '@/lib/actions/gamification'
import { AchievementsClientPage } from './AchievementsClientPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Osiągnięcia | TimeWizard',
  description: 'Twoje osiągnięcia i postępy w produktywności.',
}

export default async function AchievementsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [achievements, stats] = await Promise.all([
    getAllAchievements(),
    getUserStats(),
  ])

  return (
    <AchievementsClientPage 
      achievements={achievements} 
      stats={stats} 
    />
  )
}
