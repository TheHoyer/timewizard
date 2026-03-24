import { addMinutes, isWithinInterval, setHours, setMinutes } from 'date-fns'


interface SchedulingTask {
  id: string
  title: string
  priority: number
  estimatedMinutes: number
  dueDate: Date | null
  status: string
  category?: { name: string; color: string } | null
}


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

export function calculateUrgencyScore(task: SchedulingTask, now: Date = new Date()): number {
  const baseScore = task.priority * 20 

  if (!task.dueDate) {
    return baseScore
  }

  const hoursUntilDue = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  
  if (hoursUntilDue < 0) {
    return baseScore + 200
  }

  
  const urgencyBonus = Math.max(0, 100 - hoursUntilDue * 2)

  return baseScore + urgencyBonus
}

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

export function generateSchedule(
  tasks: SchedulingTask[],
  availabilityBlocks: SchedulingAvailabilityBlock[],
  startDate: Date = new Date(),
  daysAhead: number = 7
): ScheduledTaskResult[] {
  const now = new Date()
  const results: ScheduledTaskResult[] = []

  
  const activeTasks = tasks.filter(
    (t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS'
  )

  
  const sortedTasks = [...activeTasks].sort(
    (a, b) => calculateUrgencyScore(b, now) - calculateUrgencyScore(a, now)
  )

  
  const allSlots: TimeSlot[] = []
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    allSlots.push(...generateTimeSlotsForDay(date, availabilityBlocks))
  }

  
  allSlots.sort((a, b) => a.start.getTime() - b.start.getTime())

  
  const occupiedTimes: { start: Date; end: Date }[] = []

  
  for (const task of sortedTasks) {
    let scheduled = false

    for (const slot of allSlots) {
      if (scheduled) break

      
      if (slot.start < now) continue

      
      let potentialStart = new Date(slot.start)
      const taskEnd = addMinutes(potentialStart, task.estimatedMinutes)

      
      if (taskEnd > slot.end) continue

      
      let hasCollision = false
      for (const occupied of occupiedTimes) {
        if (
          isWithinInterval(potentialStart, { start: occupied.start, end: occupied.end }) ||
          isWithinInterval(taskEnd, { start: occupied.start, end: occupied.end }) ||
          (potentialStart <= occupied.start && taskEnd >= occupied.end)
        ) {
          
          potentialStart = new Date(occupied.end)
          const newTaskEnd = addMinutes(potentialStart, task.estimatedMinutes)

          if (newTaskEnd <= slot.end) {
            
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

export function canAddMoreTasks(currentCount: number, maxTasks: number): boolean {
  return currentCount < maxTasks
}

export function canAddMoreCategories(currentCount: number, maxCategories: number): boolean {
  return currentCount < maxCategories
}
