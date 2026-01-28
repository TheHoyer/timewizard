import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTaskStats } from '@/lib/actions/tasks'
import { StatsClient } from './StatsClient'

export const metadata = {
  title: 'Statystyki | TimeWizard',
  description: 'Statystyki produktywności',
}

export default async function StatsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const weekStats = await getTaskStats('week')
  const monthStats = await getTaskStats('month')

  return (
    <StatsClient
      initialWeekStats={weekStats.success ? weekStats.data : null}
      initialMonthStats={monthStats.success ? monthStats.data : null}
    />
  )
}
