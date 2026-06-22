import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (plan) where.plan = plan

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          payments: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      }),
      prisma.subscription.count({ where: where as any }),
    ])

    return NextResponse.json({
      success: true,
      subscriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Admin subscriptions error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(5, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, plan, endsAt } = body

    if (!userId || !plan) {
      return NextResponse.json(
        { success: false, message: 'userId and plan are required.' },
        { status: 400 }
      )
    }

    const validPlans = ['FREE', 'PREMIUM', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { success: false, message: `Plan must be one of: ${validPlans.join(', ')}` },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      )
    }

    const existingSub = await prisma.subscription.findUnique({ where: { userId } })

    let subscription
    if (existingSub) {
      subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          plan,
          status: plan === 'FREE' ? 'EXPIRED' : 'ACTIVE',
          endsAt: endsAt ? new Date(endsAt) : plan === 'FREE' ? null : plan === 'LIFETIME' ? null : existingSub.endsAt,
          cancelledAt: plan === 'FREE' ? new Date() : null,
        },
      })
    } else {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          plan,
          status: plan === 'FREE' ? 'ACTIVE' : 'ACTIVE',
          endsAt: endsAt ? new Date(endsAt) : plan === 'LIFETIME' ? null : null,
        },
      })
    }

    await prisma.adminLog.create({
      data: {
        adminId: session.sub,
        action: 'CHANGE_SUBSCRIPTION',
        targetId: userId,
        targetType: 'user',
        details: `Changed subscription for ${user.email} to ${plan}${endsAt ? ` until ${new Date(endsAt).toLocaleDateString()}` : ''}`,
      },
    })

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('Admin subscription change error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
