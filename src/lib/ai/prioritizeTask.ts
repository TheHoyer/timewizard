import { createHash } from 'crypto'
import { z } from 'zod'

type PrioritySource = 'ai' | 'rules'

export type TaskPriorityInput = {
  title: string
  description?: string | null
  estimatedMinutes: number
  dueDate?: Date | null
  isRecurring?: boolean
  recurringType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null
  categoryName?: string | null
  suggestedPriority?: number
}

export type TaskPriorityResult = {
  priority: number
  confidence: number
  source: PrioritySource
  reasoning: string
}

const aiResponseSchema = z.object({
  priority: z.coerce.number().int().min(1).max(5),
  confidence: z.coerce.number().min(0).max(1).default(0.7),
  reasoning: z.string().min(1).max(500).default('AI recommendation'),
})

type CacheEntry = {
  expiresAt: number
  result: TaskPriorityResult
}

const priorityCache = new Map<string, CacheEntry>()

const KEYWORDS_HIGH = [
  'pilne',
  'natychmiast',
  'asap',
  'krytyczne',
  'blocker',
  'deadline',
  'ważne',
  'urgent',
  'production',
  'incident',
]

const KEYWORDS_MEDIUM = [
  'klient',
  'prezentacja',
  'spotkanie',
  'raport',
  'faktura',
  'review',
  'release',
  'deploy',
]

function clampPriority(priority: number): number {
  return Math.max(1, Math.min(5, Math.round(priority)))
}

function deterministicPriority(input: TaskPriorityInput): TaskPriorityResult {
  let score = 0
  let signals = 0

  const text = `${input.title} ${input.description || ''}`.toLowerCase()

  const highHits = KEYWORDS_HIGH.filter((k) => text.includes(k)).length
  if (highHits > 0) {
    score += highHits * 14
    signals++
  }

  const mediumHits = KEYWORDS_MEDIUM.filter((k) => text.includes(k)).length
  if (mediumHits > 0) {
    score += mediumHits * 7
    signals++
  }

  if (input.dueDate) {
    const now = Date.now()
    const diffMs = input.dueDate.getTime() - now
    const daysLeft = diffMs / (1000 * 60 * 60 * 24)

    if (daysLeft <= 0) score += 45
    else if (daysLeft <= 1) score += 35
    else if (daysLeft <= 3) score += 25
    else if (daysLeft <= 7) score += 15
    else if (daysLeft <= 14) score += 8

    signals++
  }

  if (input.estimatedMinutes <= 30) score += 8
  else if (input.estimatedMinutes <= 120) score += 5
  else if (input.estimatedMinutes > 240) score -= 3
  signals++

  if (input.isRecurring) {
    score += 5
    signals++
  }

  if (input.categoryName && ['praca', 'work', 'biznes'].includes(input.categoryName.toLowerCase())) {
    score += 4
    signals++
  }

  let priority: number
  if (score >= 70) priority = 5
  else if (score >= 50) priority = 4
  else if (score >= 30) priority = 3
  else if (score >= 15) priority = 2
  else priority = 1

  if (input.suggestedPriority && input.suggestedPriority >= 1 && input.suggestedPriority <= 5) {
    
    priority = clampPriority((priority * 0.7) + (input.suggestedPriority * 0.3))
  }

  return {
    priority,
    confidence: Math.min(0.92, 0.55 + (signals * 0.07)),
    source: 'rules',
    reasoning: 'Deterministyczny scoring oparty o deadline, słowa kluczowe i szacowany czas.',
  }
}

function getCacheKey(input: TaskPriorityInput): string {
  const normalized = JSON.stringify({
    title: input.title.trim().toLowerCase(),
    description: (input.description || '').trim().toLowerCase(),
    estimatedMinutes: input.estimatedMinutes,
    dueDate: input.dueDate ? input.dueDate.toISOString() : null,
    isRecurring: !!input.isRecurring,
    recurringType: input.recurringType || null,
    categoryName: (input.categoryName || '').trim().toLowerCase(),
    suggestedPriority: input.suggestedPriority || null,
  })

  return createHash('sha256').update(normalized).digest('hex')
}

function readCache(key: string): TaskPriorityResult | null {
  const entry = priorityCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    priorityCache.delete(key)
    return null
  }
  return entry.result
}

function writeCache(key: string, result: TaskPriorityResult) {
  const ttlMs = Number(process.env.AI_PRIORITY_CACHE_TTL_MS || 6 * 60 * 60 * 1000)
  priorityCache.set(key, {
    expiresAt: Date.now() + Math.max(60_000, ttlMs),
    result,
  })
}

function isAiEnabled() {
  return process.env.AI_PRIORITY_ENABLED !== 'false'
}

async function callAi(input: TaskPriorityInput): Promise<TaskPriorityResult | null> {
  const apiUrl = process.env.AI_PRIORITY_API_URL
  const apiKey = process.env.AI_PRIORITY_API_KEY
  const model = process.env.AI_PRIORITY_MODEL

  if (!apiUrl || !apiKey || !model || !isAiEnabled()) {
    return null
  }

  const timeoutMs = Number(process.env.AI_PRIORITY_TIMEOUT_MS || 2500)
  const retries = Number(process.env.AI_PRIORITY_RETRIES || 1)

  const prompt = {
    task: {
      title: input.title,
      description: input.description || '',
      estimatedMinutes: input.estimatedMinutes,
      dueDate: input.dueDate ? input.dueDate.toISOString() : null,
      isRecurring: !!input.isRecurring,
      recurringType: input.recurringType || null,
      categoryName: input.categoryName || null,
      suggestedPriority: input.suggestedPriority || null,
    },
    rules: 'Oceń priorytet 1-5. 5 = krytyczne/terminowe. Odpowiedz WYŁĄCZNIE JSON: {"priority": number, "confidence": 0-1, "reasoning": string}',
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'Jesteś silnikiem priorytetyzacji zadań. Zwracaj wyłącznie JSON.',
            },
            {
              role: 'user',
              content: JSON.stringify(prompt),
            },
          ],
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`AI HTTP ${response.status}`)
      }

      const payload = await response.json()
      const rawContent = payload?.choices?.[0]?.message?.content
      if (typeof rawContent !== 'string') {
        throw new Error('AI response missing content')
      }

      const parsedJson = JSON.parse(rawContent)
      const parsed = aiResponseSchema.parse(parsedJson)

      return {
        priority: clampPriority(parsed.priority),
        confidence: parsed.confidence,
        source: 'ai',
        reasoning: parsed.reasoning,
      }
    } catch (error) {
      if (attempt === retries) {
        console.warn('AI prioritization failed, using rules fallback:', error)
      }
    } finally {
      clearTimeout(timer)
    }
  }

  return null
}

export async function prioritizeTask(input: TaskPriorityInput): Promise<TaskPriorityResult> {
  const key = getCacheKey(input)
  const cached = readCache(key)
  if (cached) return cached

  const ai = await callAi(input)
  const result = ai ?? deterministicPriority(input)

  writeCache(key, result)
  return result
}

export function getAiPrioritizationStatus() {
  return {
    enabled: isAiEnabled(),
    configured:
      Boolean(process.env.AI_PRIORITY_API_URL) &&
      Boolean(process.env.AI_PRIORITY_API_KEY) &&
      Boolean(process.env.AI_PRIORITY_MODEL),
    model: process.env.AI_PRIORITY_MODEL || null,
  }
}
