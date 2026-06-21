import { NextRequest, NextResponse } from 'next/server'
import {
  expireSubscriptionsJob,
  cleanupJob,
} from '@/lib/scheduler'

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret) {
    console.warn('[Cron] CRON_SECRET not configured, allowing request')
    return true
  }

  if (authHeader === `Bearer ${secret}`) {
    return true
  }

  const querySecret = request.nextUrl.searchParams.get('secret')
  if (querySecret === secret) {
    return true
  }

  return false
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const job = request.nextUrl.searchParams.get('job')

  if (!job) {
    return NextResponse.json(
      { success: false, message: 'Missing job parameter' },
      { status: 400 }
    )
  }

  try {
    switch (job) {
      case 'strategies':
        return NextResponse.json({ success: true, message: 'Auto strategy generation is disabled. Strategies are now created manually via the Admin Dashboard.' })

      case 'expire': {
        await expireSubscriptionsJob()
        return NextResponse.json({ success: true, message: 'Subscriptions expired' })
      }

      case 'cleanup': {
        await cleanupJob()
        return NextResponse.json({ success: true, message: 'Cleanup completed' })
      }

      default:
        return NextResponse.json(
          { success: false, message: `Unknown job: ${job}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error(`[Cron] Job ${job} failed:`, error)
    return NextResponse.json(
      { success: false, message: `Job ${job} failed` },
      { status: 500 }
    )
  }
}
