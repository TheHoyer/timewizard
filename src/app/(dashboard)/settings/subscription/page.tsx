import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SubscriptionClient } from './SubscriptionClient'

export const metadata = {
  title: 'Subskrypcja | TimeWizard',
  description: 'Zarządzaj swoją subskrypcją i planem.',
}

export default async function SubscriptionPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      _count: {
        select: {
          tasks: true,
          categories: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/login')
  }

  // Pobierz limity dla aktualnego planu
  const planLimits = await prisma.planLimit.findUnique({
    where: { plan: user.plan },
  })

  return (
    <SubscriptionClient
      currentPlan={user.plan}
      usage={{
        tasks: user._count.tasks,
        categories: user._count.categories,
      }}
      limits={{
        maxTasks: planLimits?.maxTasks ?? 50,
        maxCategories: planLimits?.maxCategories ?? 5,
      }}
      subscription={{
        customerId: user.stripeCustomerId,
        subscriptionId: user.stripeSubscriptionId,
        priceId: user.stripePriceId,
        currentPeriodEnd: user.stripeCurrentPeriodEnd,
      }}
    />
  )
}
