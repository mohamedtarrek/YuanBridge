import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'

export async function GET() {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || (session.role !== 'MODERATOR' && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers,
      totalPremiumUsers,
      monthlyUsers,
      quarterlyUsers,
      yearlyUsers,
      lifetimeUsers,
      totalFreeUsers,
      totalAdmins,
      totalModerators,
      totalStrategies,
      publishedStrategies,
      draftStrategies,
      featuredStrategies,
      totalCategories,
      totalSubscriptions,
      activeSubscriptions,
      totalPayments,
      revenueThisMonth,
      usersToday,
      strategiesCreatedToday,
      totalPremiumStrategies,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscription: { plan: { in: ['PREMIUM', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME'] } } } }),
      prisma.user.count({ where: { subscription: { plan: 'MONTHLY' } } }),
      prisma.user.count({ where: { subscription: { plan: 'QUARTERLY' } } }),
      prisma.user.count({ where: { subscription: { plan: 'YEARLY' } } }),
      prisma.user.count({ where: { subscription: { plan: 'LIFETIME' } } }),
      prisma.user.count({ where: { subscription: { plan: 'FREE' } } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.user.count({ where: { role: 'MODERATOR' } }),
      prisma.strategy.count(),
      prisma.strategy.count({ where: { status: 'PUBLISHED' } }),
      prisma.strategy.count({ where: { status: 'DRAFT' } }),
      prisma.strategy.count({ where: { status: 'FEATURED' } }),
      prisma.category.count(),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: thisMonthStart },
          status: 'SUCCEEDED',
        },
      }),
      prisma.user.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.strategy.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.strategy.count({ where: { isPremium: true } }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalPremiumUsers,
        monthlyUsers,
        quarterlyUsers,
        yearlyUsers,
        lifetimeUsers,
        totalFreeUsers,
        totalAdmins,
        totalModerators,
        totalStrategies,
        publishedStrategies,
        draftStrategies,
        featuredStrategies,
        totalCategories,
        totalSubscriptions,
        activeSubscriptions,
        totalPayments,
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
        usersToday,
        strategiesCreatedToday,
        totalPremiumStrategies,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
