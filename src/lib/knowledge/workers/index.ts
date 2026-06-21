interface WorkerStatus {
  name: string
  isRunning: boolean
  lastRunAt: string | null
  lastResult: string | null
  interval: string
}

const workerStatuses: Map<string, WorkerStatus> = new Map()

function getWorkerStatus(name: string): WorkerStatus {
  if (!workerStatuses.has(name)) {
    workerStatuses.set(name, {
      name,
      isRunning: false,
      lastRunAt: null,
      lastResult: null,
      interval: 'triggered',
    })
  }
  return workerStatuses.get(name)!
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

export function updateWorkerStatus(name: string, result: string): void {
  const status = getWorkerStatus(name)
  status.lastRunAt = new Date().toISOString()
  status.lastResult = result
}

export { runDiscoveryWorker } from './discovery-worker'
export { runExtractionWorker } from './extraction-worker'
export { runValidationWorker } from './validation-worker'
export { runPublishWorker } from './publish-worker'
