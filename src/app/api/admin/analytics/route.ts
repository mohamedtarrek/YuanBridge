import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'

    const now = new Date()
    let periodStart: Date

    switch (period) {
      case 'week':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        periodStart = new Date(now.getFullYear(), 0, 1)
        break
      case 'all':
        periodStart = new Date(0)
        break
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const [userGrowth, strategyGrowth, pairDistribution, statusDistribution, recentStrategies] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: periodStart } },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      prisma.strategy.findMany({
        where: { createdAt: { gte: periodStart } },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true, status: true },
      }),
      prisma.strategy.groupBy({
        by: ['currencyPair'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
      prisma.strategy.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.strategy.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          confidence: true,
          direction: true,
          createdAt: true,
          currencyPair: true,
        },
      }),
    ])

    const userGrowthByDay = aggregateByDay(userGrowth, periodStart, now)
    const strategyGrowthByDay = aggregateByDay(strategyGrowth, periodStart, now)

    return NextResponse.json({
      success: true,
      analytics: {
        userGrowth: userGrowthByDay,
        strategyGrowth: strategyGrowthByDay,
        pairDistribution,
        statusDistribution,
        recentStrategies,
      },
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

function aggregateByDay(
  items: { createdAt: Date }[],
  start: Date,
  end: Date
): { date: string; count: number; total: number }[] {
  const dayMap = new Map<string, number>()
  let runningTotal = 0

  const current = new Date(start)
  while (current <= end) {
    dayMap.set(current.toISOString().split('T')[0], 0)
    current.setDate(current.getDate() + 1)
  }

  for (const item of items) {
    const day = item.createdAt.toISOString().split('T')[0]
    dayMap.set(day, (dayMap.get(day) || 0) + 1)
  }

  const result: { date: string; count: number; total: number }[] = []
  const sortedDays = Array.from(dayMap.keys()).sort()

  for (const day of sortedDays) {
    const count = dayMap.get(day) || 0
    runningTotal += count
    result.push({ date: day, count, total: runningTotal })
  }

  return result
}
