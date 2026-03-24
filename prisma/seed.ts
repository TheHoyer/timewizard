import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const achievements = [
  
  {
    code: 'first_task',
    name: 'Pierwszy krok',
    description: 'Ukończ swoje pierwsze zadanie',
    icon: '🎯',
  },
  {
    code: 'tasks_10',
    name: 'Produktywny początek',
    description: 'Ukończ 10 zadań',
    icon: '📝',
  },
  {
    code: 'tasks_50',
    name: 'Zadaniowiec',
    description: 'Ukończ 50 zadań',
    icon: '📋',
  },
  {
    code: 'tasks_100',
    name: 'Centurion',
    description: 'Ukończ 100 zadań',
    icon: '💯',
  },
  {
    code: 'tasks_500',
    name: 'Mistrz produktywności',
    description: 'Ukończ 500 zadań',
    icon: '🏆',
  },
  
  
  {
    code: 'streak_3',
    name: 'Dobra passa',
    description: 'Utrzymaj 3-dniowy streak',
    icon: '🔥',
  },
  {
    code: 'streak_7',
    name: 'Tygodniowy wojownik',
    description: 'Utrzymaj 7-dniowy streak',
    icon: '⚡',
  },
  {
    code: 'streak_30',
    name: 'Miesiąc perfekcji',
    description: 'Utrzymaj 30-dniowy streak',
    icon: '🌟',
  },
  {
    code: 'streak_100',
    name: 'Legenda',
    description: 'Utrzymaj 100-dniowy streak',
    icon: '👑',
  },
  
  
  {
    code: 'pomodoro_1',
    name: 'Pierwsze pomodoro',
    description: 'Ukończ swoją pierwszą sesję pomodoro',
    icon: '🍅',
  },
  {
    code: 'pomodoro_25',
    name: 'Pomodoro adept',
    description: 'Ukończ 25 sesji pomodoro',
    icon: '⏱️',
  },
  {
    code: 'pomodoro_100',
    name: 'Pomodoro mistrz',
    description: 'Ukończ 100 sesji pomodoro',
    icon: '⏰',
  },
  
  
  {
    code: 'time_1h',
    name: 'Pierwsza godzina',
    description: 'Śledź łącznie 1 godzinę pracy',
    icon: '⌚',
  },
  {
    code: 'time_10h',
    name: 'Czas płynie',
    description: 'Śledź łącznie 10 godzin pracy',
    icon: '🕐',
  },
  {
    code: 'time_100h',
    name: 'Mistrz czasu',
    description: 'Śledź łącznie 100 godzin pracy',
    icon: '🕰️',
  },
  
  
  {
    code: 'level_5',
    name: 'Początkujący',
    description: 'Osiągnij poziom 5',
    icon: '📈',
  },
  {
    code: 'level_10',
    name: 'Zaawansowany',
    description: 'Osiągnij poziom 10',
    icon: '📊',
  },
  {
    code: 'level_25',
    name: 'Ekspert',
    description: 'Osiągnij poziom 25',
    icon: '🎖️',
  },
  {
    code: 'level_50',
    name: 'Guru produktywności',
    description: 'Osiągnij poziom 50',
    icon: '🏅',
  },
  
  
  {
    code: 'early_bird',
    name: 'Ranny ptaszek',
    description: 'Ukończ zadanie przed 7:00 rano',
    icon: '🌅',
  },
  {
    code: 'night_owl',
    name: 'Nocna sowa',
    description: 'Ukończ zadanie po 23:00',
    icon: '🦉',
  },
  {
    code: 'perfectionist',
    name: 'Perfekcjonista',
    description: 'Ukończ wszystkie podzadania w zadaniu',
    icon: '✨',
  },
  {
    code: 'category_master',
    name: 'Mistrz kategorii',
    description: 'Utwórz 5 kategorii',
    icon: '🗂️',
  },
]

async function main() {
  console.log('🌱 Seeding database...')
  
  
  console.log('\n📦 Seeding achievements...')
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    })
    console.log(`  ✓ ${achievement.name}`)
  }
  console.log(`✅ Seeded ${achievements.length} achievements`)

  
  console.log('\n📦 Seeding plan limits...')
  const planLimits = [
    {
      plan: 'FREE',
      maxTasks: 50,
      maxCategories: 5,
      historyDays: 30,
      features: JSON.stringify(['basic_tasks', 'categories', 'pomodoro', 'basic_stats']),
    },
    {
      plan: 'PRO',
      maxTasks: 500,
      maxCategories: 20,
      historyDays: 365,
      features: JSON.stringify([
        'basic_tasks', 'categories', 'pomodoro', 'basic_stats',
        'advanced_stats', 'export_csv', 'recurring_tasks', 'ai_scheduling',
        'google_calendar', 'unlimited_history', 'priority_support'
      ]),
    },
    {
      plan: 'BUSINESS',
      maxTasks: -1,
      maxCategories: -1,
      historyDays: -1,
      features: JSON.stringify([
        'basic_tasks', 'categories', 'pomodoro', 'basic_stats',
        'advanced_stats', 'export_csv', 'recurring_tasks', 'ai_scheduling',
        'google_calendar', 'unlimited_history', 'priority_support',
        'team_workspaces', 'api_access', 'audit_log', 'sso', 'slack_integration'
      ]),
    },
  ]

  for (const limit of planLimits) {
    await prisma.planLimit.upsert({
      where: { plan: limit.plan },
      update: limit,
      create: limit,
    })
    console.log(`  ✓ Plan ${limit.plan}`)
  }
  console.log(`✅ Seeded ${planLimits.length} plan limits`)

  console.log('\n🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
