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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers,
      activeSubscriptions,
      monthlyPayments,
      strategiesCount,
      premiumUsers,
      publishedStrategies,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.count({
        where: { createdAt: { gte: startOfMonth }, status: 'SUCCEEDED' },
      }),
      prisma.strategy.count(),
      prisma.subscription.count({ where: { plan: 'PREMIUM', status: 'ACTIVE' } }),
      prisma.strategy.count({ where: { isPublished: true } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCEEDED' },
      }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions,
        monthlyPayments,
        strategiesCount,
        premiumUsers,
        publishedStrategies,
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: 0,
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
