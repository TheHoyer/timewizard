import { NextResponse } from 'next/server'

import { reportError, type MonitoredError } from '@/lib/monitoring/reportError'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<MonitoredError>
    if (!body?.message || !body?.context) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await reportError({
      source: body.source || 'client',
      context: body.context,
      message: body.message,
      stack: body.stack,
      digest: body.digest,
      path: body.path,
      severity: body.severity || 'error',
      extra: body.extra,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    await reportError({
      source: 'server',
      context: 'api-monitoring-error',
      message: error instanceof Error ? error.message : 'Unknown monitoring error',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'error',
    })

    return NextResponse.json({ error: 'Failed to process monitoring event' }, { status: 500 })
  }
}
