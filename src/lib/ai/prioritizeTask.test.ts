import { beforeEach, describe, expect, it } from 'vitest'

import { getAiPrioritizationStatus, prioritizeTask } from './prioritizeTask'

describe('AI prioritization fallback flow', () => {
  const envBackup = { ...process.env }

  beforeEach(() => {
    process.env = { ...envBackup }
    process.env.AI_PRIORITY_ENABLED = 'false'
    process.env.AI_PRIORITY_API_URL = ''
    process.env.AI_PRIORITY_API_KEY = ''
    process.env.AI_PRIORITY_MODEL = ''
  })

  it('uses deterministic rules when external AI is disabled', async () => {
    const result = await prioritizeTask({
      title: 'Pilne: popraw production incident',
      description: 'asap, krytyczne',
      estimatedMinutes: 20,
      dueDate: new Date(Date.now() - 60_000),
      isRecurring: false,
    })

    expect(result.source).toBe('rules')
    expect(result.priority).toBeGreaterThanOrEqual(4)
    expect(result.reasoning).toContain('Deterministyczny')
  })

  it('reports unconfigured AI status correctly', () => {
    const status = getAiPrioritizationStatus()

    expect(status.enabled).toBe(false)
    expect(status.configured).toBe(false)
    expect(status.model).toBeNull()
  })
})
