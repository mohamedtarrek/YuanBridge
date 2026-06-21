import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import { createCheckoutSession, createPayPalOrder } from '@/lib/payment'

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

    const body = await request.json()
    const { plan, paymentMethod } = body as {
      plan: string
      paymentMethod: 'stripe' | 'paypal'
    }

    if (plan !== 'premium') {
      return NextResponse.json(
        { success: false, message: "Plan must be 'premium'." },
        { status: 400 }
      )
    }

    if (!['stripe', 'paypal'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: "paymentMethod must be 'stripe' or 'paypal'." },
        { status: 400 }
      )
    }

    let existingSub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (existingSub && existingSub.status === 'ACTIVE' && existingSub.plan === 'PREMIUM') {
      return NextResponse.json(
        { success: false, message: 'Already have an active premium subscription.' },
        { status: 400 }
      )
    }

    const now = new Date()
    const endsAt = new Date(now)
    endsAt.setDate(endsAt.getDate() + 30)

    let subscription

    if (paymentMethod === 'stripe') {
      const checkout = await createCheckoutSession('price_premium_monthly', session.user.id)
      subscription = await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: {
          plan: 'PREMIUM',
          status: 'TRIALING',
          endsAt,
        },
        create: {
          userId: session.user.id,
          plan: 'PREMIUM',
          status: 'TRIALING',
          endsAt,
        },
      })
      return NextResponse.json({
        success: true,
        message: 'Redirecting to checkout.',
        subscription,
        checkoutUrl: checkout.url,
      }, { status: 201 })
    }

    const paypalOrder = await createPayPalOrder(session.user.id)
    subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        plan: 'PREMIUM',
        status: 'TRIALING',
        endsAt,
      },
      create: {
        userId: session.user.id,
        plan: 'PREMIUM',
        status: 'TRIALING',
        endsAt,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'PayPal order created.',
      subscription,
      orderId: paypalOrder.orderId,
    }, { status: 201 })
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
