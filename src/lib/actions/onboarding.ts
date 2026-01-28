'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export type UserGoal = 'WORK' | 'STUDIES' | 'PROJECTS' | 'PERSONAL'

// Predefiniowane zadania dla każdego celu
const STARTER_TASKS = {
  WORK: [
    { title: '✨ Witaj w TimeWizard!', priority: 4, estimatedMinutes: 5, description: 'Ukończ to zadanie klikając checkbox po lewej stronie. Zdobędziesz pierwsze punkty!' },
    { title: '🎯 Wypróbuj Focus Mode', priority: 3, estimatedMinutes: 25, description: 'Przejdź do zakładki "Focus" i uruchom timer Pomodoro. 25 minut skupionej pracy!' },
    { title: 'Sprawdź poranną pocztę', priority: 3, estimatedMinutes: 15, description: 'Przejrzyj skrzynkę i odpowiedz na pilne wiadomości' },
    { title: 'Zaplanuj dzień pracy', priority: 4, estimatedMinutes: 10, description: 'Ustal priorytety na dziś' },
    { title: 'Przygotuj raport tygodniowy', priority: 2, estimatedMinutes: 45, description: 'Podsumowanie postępów z tego tygodnia' },
  ],
  STUDIES: [
    { title: '✨ Witaj w TimeWizard!', priority: 4, estimatedMinutes: 5, description: 'Ukończ to zadanie klikając checkbox po lewej stronie. Zdobędziesz pierwsze punkty!' },
    { title: '🎯 Wypróbuj Focus Mode', priority: 3, estimatedMinutes: 25, description: 'Przejdź do zakładki "Focus" i uruchom timer Pomodoro - idealny do nauki!' },
    { title: 'Przejrzyj notatki z wykładu', priority: 3, estimatedMinutes: 30, description: 'Uporządkuj i uzupełnij notatki' },
    { title: 'Rozwiąż zadania domowe', priority: 4, estimatedMinutes: 60, description: 'Matematyka - rozdział 5' },
    { title: 'Przygotuj się do kolokwium', priority: 5, estimatedMinutes: 90, description: 'Powtórka materiału z ostatnich 3 tygodni' },
  ],
  PROJECTS: [
    { title: '✨ Witaj w TimeWizard!', priority: 4, estimatedMinutes: 5, description: 'Ukończ to zadanie klikając checkbox po lewej stronie. Zdobędziesz pierwsze punkty!' },
    { title: '🎯 Wypróbuj Focus Mode', priority: 3, estimatedMinutes: 25, description: 'Przejdź do zakładki "Focus" i uruchom timer Pomodoro - świetny dla deep work!' },
    { title: 'Zdefiniuj cele projektu', priority: 4, estimatedMinutes: 30, description: 'Spisz główne cele i kamienie milowe' },
    { title: 'Stwórz listę zadań', priority: 3, estimatedMinutes: 20, description: 'Rozbij projekt na mniejsze zadania' },
    { title: 'Zaplanuj pierwszy sprint', priority: 3, estimatedMinutes: 45, description: 'Określ zadania na najbliższe 2 tygodnie' },
  ],
  PERSONAL: [
    { title: '✨ Witaj w TimeWizard!', priority: 4, estimatedMinutes: 5, description: 'Ukończ to zadanie klikając checkbox po lewej stronie. Zdobędziesz pierwsze punkty!' },
    { title: '🎯 Wypróbuj Focus Mode', priority: 3, estimatedMinutes: 25, description: 'Przejdź do zakładki "Focus" i uruchom timer Pomodoro - świetny do medytacji!' },
    { title: 'Poranny trening', priority: 3, estimatedMinutes: 30, description: '20 min ćwiczeń + rozciąganie' },
    { title: 'Medytacja i planowanie', priority: 2, estimatedMinutes: 15, description: '10 min medytacji, 5 min na plan dnia' },
    { title: 'Przeczytaj 30 stron książki', priority: 2, estimatedMinutes: 45, description: 'Kontynuuj aktualną lekturę' },
  ],
}

const STARTER_CATEGORIES = {
  WORK: [
    { name: 'Praca', color: '#3B82F6', icon: '💼' },
    { name: 'Spotkania', color: '#8B5CF6', icon: '📅' },
    { name: 'Pilne', color: '#EF4444', icon: '🔥' },
  ],
  STUDIES: [
    { name: 'Wykłady', color: '#3B82F6', icon: '📚' },
    { name: 'Projekty', color: '#10B981', icon: '🎯' },
    { name: 'Egzaminy', color: '#EF4444', icon: '📝' },
  ],
  PROJECTS: [
    { name: 'Planowanie', color: '#8B5CF6', icon: '📋' },
    { name: 'Development', color: '#3B82F6', icon: '💻' },
    { name: 'Research', color: '#F59E0B', icon: '🔍' },
  ],
  PERSONAL: [
    { name: 'Zdrowie', color: '#10B981', icon: '🏃' },
    { name: 'Rozwój', color: '#8B5CF6', icon: '📖' },
    { name: 'Dom', color: '#F59E0B', icon: '🏠' },
  ],
}

// Pobierz stan onboardingu
export async function getOnboardingStatus() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompleted: true,
        onboardingStep: true,
        userGoal: true,
        firstLoginAt: true,
        tooltipsShown: true,
        createdAt: true,
      },
    })

    if (!user) {
      return { success: false as const, error: 'Użytkownik nie istnieje' }
    }

    // Sprawdź czy to pierwszy login
    const isFirstLogin = !user.firstLoginAt

    // Oblicz ile dni od rejestracji
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Tooltips przez pierwsze 7 dni
    const showTooltips = daysSinceRegistration < 7

    return {
      success: true as const,
      data: {
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
        userGoal: user.userGoal as UserGoal | null,
        isFirstLogin,
        showTooltips,
        tooltipsShown: user.tooltipsShown ? JSON.parse(user.tooltipsShown) as string[] : [],
      },
    }
  } catch (error) {
    console.error('Get onboarding status error:', error)
    return { success: false as const, error: 'Nie udało się pobrać statusu' }
  }
}

// Ustaw cel użytkownika
export async function setUserGoal(goal: UserGoal) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        userGoal: goal,
        onboardingStep: 1,
        firstLoginAt: new Date(),
      },
    })

    revalidatePath('/dashboard')
    return { success: true as const }
  } catch (error) {
    console.error('Set user goal error:', error)
    return { success: false as const, error: 'Nie udało się zapisać celu' }
  }
}

// Przejdź do następnego kroku onboardingu
export async function nextOnboardingStep() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingStep: true },
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingStep: (user?.onboardingStep || 0) + 1,
      },
    })

    revalidatePath('/dashboard')
    return { success: true as const }
  } catch (error) {
    console.error('Next onboarding step error:', error)
    return { success: false as const, error: 'Nie udało się przejść dalej' }
  }
}

// Generuj startowe kategorie i zadania
export async function generateStarterContent() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userGoal: true },
    })

    if (!user?.userGoal) {
      return { success: false as const, error: 'Najpierw wybierz swój cel' }
    }

    const goal = user.userGoal as UserGoal
    const categories = STARTER_CATEGORIES[goal]
    const tasks = STARTER_TASKS[goal]

    // Utwórz lub pobierz kategorie (upsert aby uniknąć duplikatów)
    const createdCategories = await Promise.all(
      categories.map(async (cat) => {
        // Sprawdź czy kategoria już istnieje
        const existing = await prisma.category.findFirst({
          where: {
            userId: session.user!.id!,
            name: cat.name,
          },
        })
        
        if (existing) {
          return existing
        }
        
        // Utwórz nową kategorię
        return prisma.category.create({
          data: {
            userId: session.user!.id!,
            name: cat.name,
            color: cat.color,
            icon: cat.icon,
          },
        })
      })
    )

    // Sprawdź czy zadania startowe już istnieją (po tytule)
    const existingTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        title: { in: tasks.map(t => t.title) },
      },
      select: { title: true },
    })
    const existingTaskTitles = new Set(existingTasks.map(t => t.title))

    // Utwórz tylko nowe zadania
    const today = new Date()
    const tasksToCreate = tasks.filter(task => !existingTaskTitles.has(task.title))
    
    if (tasksToCreate.length > 0) {
      await Promise.all(
        tasksToCreate.map((task, index) =>
          prisma.task.create({
            data: {
              userId: session.user!.id!,
              categoryId: createdCategories[0].id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              estimatedMinutes: task.estimatedMinutes,
              status: 'PENDING',
              dueDate: new Date(today.getTime() + index * 24 * 60 * 60 * 1000), // Kolejne dni
            },
          })
        )
      )
    }

    // Zaktualizuj postęp onboardingu
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStep: 2 },
    })

    revalidatePath('/dashboard')
    revalidatePath('/tasks')
    revalidatePath('/categories')

    return {
      success: true as const,
      data: {
        categoriesCount: createdCategories.length,
        tasksCount: tasksToCreate.length > 0 ? tasksToCreate.length : tasks.length,
      },
    }
  } catch (error) {
    console.error('Generate starter content error:', error)
    return { success: false as const, error: 'Nie udało się wygenerować zawartości' }
  }
}

// Zakończ onboarding
export async function completeOnboarding() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        onboardingStep: 3,
      },
    })

    revalidatePath('/dashboard')
    return { success: true as const }
  } catch (error) {
    console.error('Complete onboarding error:', error)
    return { success: false as const, error: 'Nie udało się zakończyć onboardingu' }
  }
}

// Pomiń onboarding
export async function skipOnboarding() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        firstLoginAt: new Date(),
      },
    })

    revalidatePath('/dashboard')
    return { success: true as const }
  } catch (error) {
    console.error('Skip onboarding error:', error)
    return { success: false as const, error: 'Nie udało się pominąć onboardingu' }
  }
}

// Oznacz tooltip jako pokazany
export async function markTooltipShown(tooltipId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tooltipsShown: true },
    })

    const shown = user?.tooltipsShown ? JSON.parse(user.tooltipsShown) as string[] : []
    
    if (!shown.includes(tooltipId)) {
      shown.push(tooltipId)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { tooltipsShown: JSON.stringify(shown) },
      })
    }

    return { success: true as const }
  } catch (error) {
    console.error('Mark tooltip shown error:', error)
    return { success: false as const, error: 'Nie udało się zapisać' }
  }
}

// Resetuj onboarding (dla testów)
export async function resetOnboarding() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Musisz być zalogowany' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: false,
        onboardingStep: 0,
        userGoal: null,
        firstLoginAt: null,
        tooltipsShown: null,
      },
    })

    revalidatePath('/dashboard')
    return { success: true as const }
  } catch (error) {
    console.error('Reset onboarding error:', error)
    return { success: false as const, error: 'Nie udało się zresetować' }
  }
}
