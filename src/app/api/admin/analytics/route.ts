import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'

export async function GET() {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

    const now = new Date()
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [payments, users, strategies, subscriptions] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: sixMonthsAgo },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.strategy.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.subscription.count({ where: { plan: 'PREMIUM' } }),
    ])

    const totalUsers = await prisma.user.count()
    const totalSubscriptions = await prisma.subscription.count()

    const revenueByMonth: Record<string, number> = {}
    for (const payment of payments) {
      const key = `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, '0')}`
      revenueByMonth[key] = (revenueByMonth[key] || 0) + payment.amount
    }

    const userGrowthByMonth: Record<string, number> = {}
    for (const user of users) {
      const key = `${user.createdAt.getFullYear()}-${String(user.createdAt.getMonth() + 1).padStart(2, '0')}`
      userGrowthByMonth[key] = (userGrowthByMonth[key] || 0) + 1
    }

    const strategiesByMonth: Record<string, number> = {}
    for (const strategy of strategies) {
      const key = `${strategy.createdAt.getFullYear()}-${String(strategy.createdAt.getMonth() + 1).padStart(2, '0')}`
      strategiesByMonth[key] = (strategiesByMonth[key] || 0) + 1
    }

    const months: string[] = []
    const d = new Date(sixMonthsAgo)
    while (d <= now) {
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      d.setMonth(d.getMonth() + 1)
    }

    const revenueOverTime = months.map((month) => ({
      month,
      revenue: revenueByMonth[month] || 0,
    }))

    const userGrowth = months.map((month) => ({
      month,
      newUsers: userGrowthByMonth[month] || 0,
    }))

    const strategyGenerationStats = months.map((month) => ({
      month,
      count: strategiesByMonth[month] || 0,
    }))

    const conversionRate = totalUsers > 0
      ? Math.round((totalSubscriptions / totalUsers) * 10000) / 100
      : 0

    return NextResponse.json({
      success: true,
      analytics: {
        revenueOverTime,
        userGrowth,
        strategyGenerationStats,
        subscriptionConversionRate: conversionRate,
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
