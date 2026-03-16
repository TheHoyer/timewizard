type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

export type MonitoredError = {
  source: 'client' | 'server'
  context: string
  message: string
  stack?: string
  digest?: string
  path?: string
  severity?: ErrorSeverity
  extra?: Record<string, unknown>
}

function safeJsonParse<T>(value: string | undefined): T | undefined {
  if (!value) return undefined
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

export async function reportError(error: MonitoredError) {
  const payload = {
    ...error,
    severity: error.severity || 'error',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    app: 'timewizard',
  }

  console.error('[monitoring]', payload)

  const webhook = process.env.MONITORING_WEBHOOK_URL
  if (!webhook) return

  const headers = {
    'Content-Type': 'application/json',
    ...(safeJsonParse<Record<string, string>>(process.env.MONITORING_WEBHOOK_HEADERS) || {}),
  }

  try {
    await fetch(webhook, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
  } catch (webhookError) {
    console.error('[monitoring] webhook delivery failed', webhookError)
  }
}
