import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import { calculateEndDate, getPlanDetails } from '@/lib/subscription/pricing'

export async function POST(request: NextRequest) {
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
    const { action, userId, plan, days, reason } = body

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, message: 'userId and action are required.' },
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

    switch (action) {
      case 'upgrade': {
        if (!plan) {
          return NextResponse.json(
            { success: false, message: 'Plan is required for upgrade.' },
            { status: 400 }
          )
        }
        const planDetails = getPlanDetails(plan)
        if (!planDetails || plan === 'FREE') {
          return NextResponse.json(
            { success: false, message: 'Invalid plan. Choose MONTHLY, QUARTERLY, YEARLY, or LIFETIME.' },
            { status: 400 }
          )
        }
        const endsAt = plan === 'LIFETIME' ? null : calculateEndDate(plan)

        if (existingSub) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              plan: plan as any,
              status: 'ACTIVE',
              endsAt,
              autoRenew: false,
              price: planDetails.price,
              currency: planDetails.currency,
              cancelledAt: null,
            },
          })
        } else {
          await prisma.subscription.create({
            data: {
              userId,
              plan: plan as any,
              status: 'ACTIVE',
              endsAt,
              price: planDetails.price,
              currency: planDetails.currency,
            },
          })
        }

        await prisma.adminLog.create({
          data: {
            adminId: session.sub,
            action: 'CHANGE_SUBSCRIPTION',
            targetId: userId,
            targetType: 'user',
            details: `Upgraded user ${user.email} to ${plan}${endsAt ? ` (ends ${endsAt.toISOString()})` : ' (lifetime)'}`,
          },
        })

        return NextResponse.json({ success: true, message: `User upgraded to ${plan}.` })
      }

      case 'downgrade': {
        if (!existingSub) {
          return NextResponse.json(
            { success: false, message: 'User has no subscription.' },
            { status: 400 }
          )
        }

        await prisma.subscription.update({
          where: { userId },
          data: {
            plan: 'FREE' as any,
            status: 'ACTIVE',
            endsAt: null,
            autoRenew: false,
            price: null,
            cancelledAt: new Date(),
          },
        })

        await prisma.adminLog.create({
          data: {
            adminId: session.sub,
            action: 'CHANGE_SUBSCRIPTION',
            targetId: userId,
            targetType: 'user',
            details: `Downgraded user ${user.email} to FREE`,
          },
        })

        return NextResponse.json({ success: true, message: 'User downgraded to Free.' })
      }

      case 'extend': {
        if (!existingSub || existingSub.plan === 'FREE') {
          return NextResponse.json(
            { success: false, message: 'User must have an active premium subscription to extend.' },
            { status: 400 }
          )
        }
        if (!days || typeof days !== 'number' || days < 1) {
          return NextResponse.json(
            { success: false, message: 'Days must be a positive number.' },
            { status: 400 }
          )
        }
        const currentEnd = existingSub.endsAt || new Date()
        const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000)

        await prisma.subscription.update({
          where: { userId },
          data: {
            endsAt: newEnd,
            status: 'ACTIVE',
          },
        })

        await prisma.adminLog.create({
          data: {
            adminId: session.sub,
            action: 'EXTEND_SUBSCRIPTION',
            targetId: userId,
            targetType: 'user',
            details: `Extended user ${user.email} subscription by ${days} days (new ends: ${newEnd.toISOString()})`,
          },
        })

        return NextResponse.json({ success: true, message: `Subscription extended by ${days} days.` })
      }

      case 'cancel': {
        if (!existingSub) {
          return NextResponse.json(
            { success: false, message: 'User has no subscription.' },
            { status: 400 }
          )
        }
        await prisma.subscription.update({
          where: { userId },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            autoRenew: false,
          },
        })

        await prisma.adminLog.create({
          data: {
            adminId: session.sub,
            action: 'CANCEL_SUBSCRIPTION',
            targetId: userId,
            targetType: 'user',
            details: `Cancelled user ${user.email} subscription. Reason: ${reason || 'No reason provided'}`,
          },
        })

        return NextResponse.json({ success: true, message: 'Subscription cancelled.' })
      }

      case 'activate': {
        if (!existingSub) {
          return NextResponse.json(
            { success: false, message: 'User has no subscription to activate.' },
            { status: 400 }
          )
        }
        await prisma.subscription.update({
          where: { userId },
          data: {
            status: 'ACTIVE',
            cancelledAt: null,
          },
        })

        await prisma.adminLog.create({
          data: {
            adminId: session.sub,
            action: 'ACTIVATE_SUBSCRIPTION',
            targetId: userId,
            targetType: 'user',
            details: `Activated user ${user.email} subscription`,
          },
        })

        return NextResponse.json({ success: true, message: 'Subscription activated.' })
      }

      case 'suspend': {
        if (!existingSub) {
          return NextResponse.json(
            { success: false, message: 'User has no subscription to suspend.' },
            { status: 400 }
          )
        }
        await prisma.subscription.update({
          where: { userId },
          data: {
            status: 'SUSPENDED',
          },
        })

        await prisma.adminLog.create({
          data: {
            adminId: session.sub,
            action: 'SUSPEND_SUBSCRIPTION',
            targetId: userId,
            targetType: 'user',
            details: `Suspended user ${user.email} subscription. Reason: ${reason || 'No reason provided'}`,
          },
        })

        return NextResponse.json({ success: true, message: 'Subscription suspended.' })
      }

      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: ${action}. Valid: upgrade, downgrade, extend, cancel, activate, suspend.` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin subscription control error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
