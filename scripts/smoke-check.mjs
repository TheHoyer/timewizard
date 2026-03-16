const baseUrl = process.env.SMOKE_BASE_URL

if (!baseUrl) {
  console.error('Brak SMOKE_BASE_URL. Przykład: SMOKE_BASE_URL=https://twoja-domena.com npm run test:smoke')
  process.exit(1)
}

const targets = [
  { path: '/api/health', expectedStatus: [200] },
  { path: '/login', expectedStatus: [200] },
  { path: '/register', expectedStatus: [200] },
  { path: '/dashboard', expectedStatus: [200, 302, 307] },
]

const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 8000)

async function checkTarget(target) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${baseUrl}${target.path}`, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    })

    const ok = target.expectedStatus.includes(response.status)
    return {
      ...target,
      status: response.status,
      ok,
    }
  } catch (error) {
    return {
      ...target,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown smoke check error',
    }
  } finally {
    clearTimeout(timer)
  }
}

const results = await Promise.all(targets.map(checkTarget))

let failed = 0
for (const result of results) {
  if (result.ok) {
    console.log(`OK   ${result.path} -> ${result.status}`)
  } else {
    failed += 1
    console.error(
      `FAIL ${result.path} -> ${result.status || 'error'}${result.error ? ` (${result.error})` : ''}`
    )
  }
}

if (failed > 0) {
  console.error(`Smoke test failed: ${failed}/${results.length} endpoint(s).`)
  process.exit(1)
}

console.log(`Smoke test passed: ${results.length}/${results.length} endpoint(s).`)
