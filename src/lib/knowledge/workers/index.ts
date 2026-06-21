import cron, { type ScheduledTask } from 'node-cron'
import { runDiscoveryWorker } from './discovery-worker'
import { runExtractionWorker } from './extraction-worker'
import { runValidationWorker } from './validation-worker'
import { runPublishWorker } from './publish-worker'
import { runCleanup } from '@/lib/knowledge/cleanup'
import { recalculateAllScores } from '@/lib/knowledge/improvement'

interface WorkerStatus {
  name: string
  isRunning: boolean
  lastRunAt: string | null
  lastResult: string | null
  interval: string
}

const workerStatuses: Map<string, WorkerStatus> = new Map()
const runningWorkers = new Set<string>()

const scheduledTasks: ScheduledTask[] = []

function getWorkerStatus(name: string): WorkerStatus {
  if (!workerStatuses.has(name)) {
    workerStatuses.set(name, {
      name,
      isRunning: false,
      lastRunAt: null,
      lastResult: null,
      interval: 'unknown',
    })
  }
  return workerStatuses.get(name)!
}

function updateWorkerStatus(name: string, result: string, isRunning: boolean = false): void {
  const status = getWorkerStatus(name)
  status.lastRunAt = new Date().toISOString()
  status.lastResult = result
  status.isRunning = isRunning
}

function updateWorkerRunning(name: string, running: boolean): void {
  const status = getWorkerStatus(name)
  status.isRunning = running
}

async function executeWorker(name: string, workerFn: () => Promise<unknown>): Promise<void> {
  if (runningWorkers.has(name)) {
    console.log(`[Workers] ${name} is already running, skipping`)
    return
  }

  runningWorkers.add(name)
  updateWorkerRunning(name, true)

  try {
    console.log(`[Workers] Starting ${name}...`)
    const result = await workerFn()
    const resultStr = JSON.stringify(result)
    updateWorkerStatus(name, resultStr)
    console.log(`[Workers] ${name} completed:`, resultStr)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    updateWorkerStatus(name, `Error: ${errorMsg}`)
    console.error(`[Workers] ${name} failed:`, error)
  } finally {
    runningWorkers.delete(name)
    updateWorkerRunning(name, false)
  }
}

export function startAllWorkers(): void {
  if (scheduledTasks.length > 0) {
    console.log('[Workers] Already running')
    return
  }

  console.log('[Workers] Starting all background workers...')

  const discoveryTask = cron.schedule('*/15 * * * *', () => {
    executeWorker('discovery', runDiscoveryWorker)
  })
  scheduledTasks.push(discoveryTask)
  const discoveryStatus = getWorkerStatus('discovery')
  discoveryStatus.interval = '*/15 * * * *'

  const extractionTask = cron.schedule('*/5 * * * *', () => {
    executeWorker('extraction', runExtractionWorker)
  })
  scheduledTasks.push(extractionTask)
  const extractionStatus = getWorkerStatus('extraction')
  extractionStatus.interval = '*/5 * * * *'

  const validationTask = cron.schedule('*/10 * * * *', () => {
    executeWorker('validation', runValidationWorker)
  })
  scheduledTasks.push(validationTask)
  const validationStatus = getWorkerStatus('validation')
  validationStatus.interval = '*/10 * * * *'

  const improvementTask = cron.schedule('0 * * * *', async () => {
    await executeWorker('improvement', async () => {
      await recalculateAllScores()
      return { status: 'completed' }
    })
  })
  scheduledTasks.push(improvementTask)
  const improvementStatus = getWorkerStatus('improvement')
  improvementStatus.interval = '0 * * * *'

  const cleanupTask = cron.schedule('0 0 * * *', () => {
    executeWorker('cleanup', runCleanup)
  })
  scheduledTasks.push(cleanupTask)
  const cleanupStatus = getWorkerStatus('cleanup')
  cleanupStatus.interval = '0 0 * * *'

  const publishTask = cron.schedule('*/5 * * * *', () => {
    executeWorker('publish', runPublishWorker)
  })
  scheduledTasks.push(publishTask)
  const publishStatus = getWorkerStatus('publish')
  publishStatus.interval = '*/5 * * * *'

  scheduledTasks.forEach(task => task.start())
  console.log('[Workers] All background workers started')
}

export function stopAllWorkers(): void {
  console.log('[Workers] Stopping all background workers...')

  scheduledTasks.forEach(task => task.stop())
  scheduledTasks.length = 0
  runningWorkers.clear()

  for (const [name] of workerStatuses) {
    const status = getWorkerStatus(name)
    status.isRunning = false
  }

  console.log('[Workers] All background workers stopped')
}

export function getAllWorkerStatuses(): WorkerStatus[] {
  const names = [
    'discovery',
    'extraction',
    'validation',
    'improvement',
    'cleanup',
    'publish',
  ]

  for (const name of names) {
    getWorkerStatus(name)
  }

  return Array.from(workerStatuses.values())
}

export { runDiscoveryWorker } from './discovery-worker'
export { runExtractionWorker } from './extraction-worker'
export { runValidationWorker } from './validation-worker'
export { runPublishWorker } from './publish-worker'
