import { addMinutes, isWithinInterval, setHours, setMinutes } from 'date-fns'

// Task type matching the Prisma schema
interface SchedulingTask {
  id: string
  title: string
  priority: number
  estimatedMinutes: number
  dueDate: Date | null
  status: string
  category?: { name: string; color: string } | null
}

// Availability block type matching Prisma schema  
interface SchedulingAvailabilityBlock {
  dayOfWeek: number
  startTime: string
  endTime: string
  blockType: string
}

interface TimeSlot {
  start: Date
  end: Date
  blockType: string
}

interface ScheduledTaskResult {
  taskId: string
  scheduledStart: Date
  scheduledEnd: Date
}

/**
 * Oblicza wskaźnik pilności zadania
 * Im wyższy wskaźnik, tym bardziej pilne zadanie
 */
export function calculateUrgencyScore(task: SchedulingTask, now: Date = new Date()): number {
  const baseScore = task.priority * 20 // 20-100 punktów za priorytet

  if (!task.dueDate) {
    return baseScore
  }

  const hoursUntilDue = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  // Zadania po terminie dostają maksymalny bonus
  if (hoursUntilDue < 0) {
    return baseScore + 200
  }

  // Im bliżej deadline, tym więcej punktów (max 100 dodatkowych)
  const urgencyBonus = Math.max(0, 100 - hoursUntilDue * 2)

  return baseScore + urgencyBonus
}

/**
 * Generuje sloty czasowe na podstawie bloków dostępności dla danego dnia
 */
export function generateTimeSlotsForDay(
  date: Date,
  availabilityBlocks: SchedulingAvailabilityBlock[]
): TimeSlot[] {
  const dayOfWeek = date.getDay()
  const blocksForDay = availabilityBlocks.filter((b) => b.dayOfWeek === dayOfWeek)

  return blocksForDay.map((block) => {
    const [startHour, startMinute] = block.startTime.split(':').map(Number)
    const [endHour, endMinute] = block.endTime.split(':').map(Number)

    const start = setMinutes(setHours(new Date(date), startHour), startMinute)
    const end = setMinutes(setHours(new Date(date), endHour), endMinute)

    return {
      start,
      end,
      blockType: block.blockType,
    }
  })
}

/**
 * Główny algorytm generowania harmonogramu (Greedy z wagami)
 */
export function generateSchedule(
  tasks: SchedulingTask[],
  availabilityBlocks: SchedulingAvailabilityBlock[],
  startDate: Date = new Date(),
  daysAhead: number = 7
): ScheduledTaskResult[] {
  const now = new Date()
  const results: ScheduledTaskResult[] = []

  // Filtruj tylko aktywne zadania (nie ukończone, nie usunięte)
  const activeTasks = tasks.filter(
    (t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS'
  )

  // Sortuj po urgency score (malejąco)
  const sortedTasks = [...activeTasks].sort(
    (a, b) => calculateUrgencyScore(b, now) - calculateUrgencyScore(a, now)
  )

  // Generuj sloty czasowe dla każdego dnia
  const allSlots: TimeSlot[] = []
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    allSlots.push(...generateTimeSlotsForDay(date, availabilityBlocks))
  }

  // Sortuj sloty chronologicznie
  allSlots.sort((a, b) => a.start.getTime() - b.start.getTime())

  // Śledzenie zajętości slotów
  const occupiedTimes: { start: Date; end: Date }[] = []

  // Przydziel zadania do slotów
  for (const task of sortedTasks) {
    let scheduled = false

    for (const slot of allSlots) {
      if (scheduled) break

      // Sprawdź czy slot jest w przyszłości
      if (slot.start < now) continue

      // Znajdź wolny czas w slocie
      let potentialStart = new Date(slot.start)
      const taskEnd = addMinutes(potentialStart, task.estimatedMinutes)

      // Sprawdź czy zadanie zmieści się w slocie
      if (taskEnd > slot.end) continue

      // Sprawdź kolizje z już zaplanowanymi zadaniami
      let hasCollision = false
      for (const occupied of occupiedTimes) {
        if (
          isWithinInterval(potentialStart, { start: occupied.start, end: occupied.end }) ||
          isWithinInterval(taskEnd, { start: occupied.start, end: occupied.end }) ||
          (potentialStart <= occupied.start && taskEnd >= occupied.end)
        ) {
          // Spróbuj przesunąć start za zajęty blok
          potentialStart = new Date(occupied.end)
          const newTaskEnd = addMinutes(potentialStart, task.estimatedMinutes)

          if (newTaskEnd <= slot.end) {
            // Sprawdź ponownie kolizje z nowym czasem
            continue
          } else {
            hasCollision = true
            break
          }
        }
      }

      if (!hasCollision) {
        const scheduledEnd = addMinutes(potentialStart, task.estimatedMinutes)

        results.push({
          taskId: task.id,
          scheduledStart: potentialStart,
          scheduledEnd: scheduledEnd,
        })

        occupiedTimes.push({
          start: potentialStart,
          end: scheduledEnd,
        })

        // Dodaj 10-minutową przerwę między zadaniami > 60 min
        if (task.estimatedMinutes > 60) {
          occupiedTimes.push({
            start: scheduledEnd,
            end: addMinutes(scheduledEnd, 10),
          })
        }

        scheduled = true
      }
    }
  }

  return results
}

/**
 * Sprawdza czy użytkownik może dodać więcej zadań (limit planu)
 */
export function canAddMoreTasks(currentCount: number, maxTasks: number): boolean {
  return currentCount < maxTasks
}

/**
 * Sprawdza czy użytkownik może dodać więcej kategorii (limit planu)
 */
export function canAddMoreCategories(currentCount: number, maxCategories: number): boolean {
  return currentCount < maxCategories
}
