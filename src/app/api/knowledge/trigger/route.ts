import { NextRequest, NextResponse } from 'next/server'
import { runDiscoveryWorker, updateWorkerStatus } from '@/lib/knowledge/workers'
import { runExtractionWorker } from '@/lib/knowledge/workers/extraction-worker'
import { runValidationWorker } from '@/lib/knowledge/workers/validation-worker'
import { runPublishWorker } from '@/lib/knowledge/workers/publish-worker'
import { runCleanup } from '@/lib/knowledge/cleanup'
import { recalculateAllScores } from '@/lib/knowledge/improvement'

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret) {
    console.warn('[KnowledgeTrigger] CRON_SECRET not configured, allowing request')
    return true
  }

  if (authHeader === `Bearer ${secret}`) {
    return true
  }

  const querySecret = request.nextUrl.searchParams.get('secret')
  if (querySecret === secret) {
    return true
  }

  const headerSecret = request.headers.get('x-cron-secret')
  if (headerSecret === secret) {
    return true
  }

  return false
}

const workerMap: Record<string, () => Promise<unknown>> = {
  discovery: runDiscoveryWorker,
  extraction: runExtractionWorker,
  validation: runValidationWorker,
  publish: runPublishWorker,
  cleanup: runCleanup,
  improvement: async () => {
    await recalculateAllScores()
    return { status: 'completed', message: 'Scores recalculated' }
  },
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Provide CRON_SECRET via Authorization header or query param.' },
      { status: 401 },
    )
  }

  const worker = request.nextUrl.searchParams.get('worker')

  if (!worker) {
    return NextResponse.json(
      { success: false, message: 'Missing worker parameter. Use ?worker=discovery|extraction|validation|cleanup|publish|improvement|all' },
      { status: 400 },
    )
  }

  if (worker === 'all') {
    const results: Record<string, unknown> = {}
    const errors: string[] = []

    for (const [name, fn] of Object.entries(workerMap)) {
      try {
        const result = await fn()
        results[name] = result
        updateWorkerStatus(name, JSON.stringify(result))
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        errors.push(`${name}: ${msg}`)
        results[name] = { error: msg }
        updateWorkerStatus(name, `Error: ${msg}`)
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    })
  }

  const workerFn = workerMap[worker]

  if (!workerFn) {
    return NextResponse.json(
      {
        success: false,
        message: `Unknown worker: ${worker}. Valid options: discovery, extraction, validation, cleanup, publish, improvement, all`,
      },
      { status: 400 },
    )
  }

  try {
    const result = await workerFn()
    updateWorkerStatus(worker, JSON.stringify(result))
    return NextResponse.json({
      success: true,
      worker,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[KnowledgeTrigger] Worker ${worker} failed:`, error)
    updateWorkerStatus(worker, `Error: ${message}`)
    return NextResponse.json(
      { success: false, worker, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}
