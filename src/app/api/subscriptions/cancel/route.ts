import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import { cancelSubscription as cancelPaymentSubscription } from '@/lib/payment'

export async function POST(request: Request) {
  try {
    const rateCheck = await rateLimit(5, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'No subscription found.' },
        { status: 404 }
      )
    }

    if (subscription.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, message: 'Subscription is already cancelled.' },
        { status: 400 }
      )
    }

    try {
      await cancelPaymentSubscription(subscription.id)
    } catch {
      const updated = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully.',
        subscription: updated,
      })
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully.',
      subscription: updated,
    })
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
