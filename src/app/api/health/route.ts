export const dynamic = 'force-dynamic'

import { getAiPrioritizationStatus } from '@/lib/ai/prioritizeTask'

export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiPrioritization: getAiPrioritizationStatus(),
  })
}
