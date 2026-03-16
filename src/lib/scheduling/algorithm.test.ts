import { describe, expect, it } from 'vitest'

import {
  calculateUrgencyScore,
  generateSchedule,
  canAddMoreTasks,
  canAddMoreCategories,
} from './algorithm'

describe('scheduling algorithm flow', () => {
  it('favors overdue high-priority tasks in urgency score', () => {
    const now = new Date('2026-01-01T10:00:00.000Z')

    const urgentTask = {
      id: 't1',
      title: 'Pilne',
      priority: 5,
      estimatedMinutes: 30,
      dueDate: new Date('2025-12-31T10:00:00.000Z'),
      status: 'PENDING',
    }

    const normalTask = {
      id: 't2',
      title: 'Normalne',
      priority: 3,
      estimatedMinutes: 30,
      dueDate: null,
      status: 'PENDING',
    }

    expect(calculateUrgencyScore(urgentTask, now)).toBeGreaterThan(
      calculateUrgencyScore(normalTask, now)
    )
  })

  it('creates schedule entries inside availability windows', () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)
    startDate.setHours(0, 0, 0, 0)
    const dayOfWeek = startDate.getDay()

    const tasks = [
      {
        id: 't1',
        title: 'Przygotuj raport',
        priority: 5,
        estimatedMinutes: 60,
        dueDate: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
    ]

    const availabilityBlocks = [
      {
        dayOfWeek,
        startTime: '09:00',
        endTime: '12:00',
        blockType: 'WORK',
      },
    ]

    const schedule = generateSchedule(tasks, availabilityBlocks, startDate, 3)
    expect(schedule.length).toBe(1)
    expect(schedule[0].taskId).toBe('t1')

    const startHour = schedule[0].scheduledStart.getHours()
    const endHour = schedule[0].scheduledEnd.getHours()
    expect(startHour).toBeGreaterThanOrEqual(9)
    expect(endHour).toBeLessThanOrEqual(12)
  })

  it('respects plan limit helpers', () => {
    expect(canAddMoreTasks(9, 10)).toBe(true)
    expect(canAddMoreTasks(10, 10)).toBe(false)
    expect(canAddMoreCategories(4, 5)).toBe(true)
    expect(canAddMoreCategories(5, 5)).toBe(false)
  })
})
