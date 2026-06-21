import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit } from '@/lib/security'
import { createPayPalOrder } from '@/lib/payment'

function getStripe() {
  const Stripe = require('stripe')
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
}

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
    const { amount, currency, provider } = body as {
      amount: number
      currency: string
      provider: 'stripe' | 'paypal'
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Amount must be a positive number.' },
        { status: 400 }
      )
    }

    if (!currency || currency.length !== 3) {
      return NextResponse.json(
        { success: false, message: 'Currency must be a 3-letter code (e.g. USD).' },
        { status: 400 }
      )
    }

    if (provider === 'stripe') {
      const stripe = getStripe()
      if (stripe) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          metadata: { userId: session.user.id },
        })

        return NextResponse.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          amount,
          currency: currency.toUpperCase(),
        })
      }
    }

    if (provider === 'paypal') {
      const paypalOrder = await createPayPalOrder(session.user.id)
      return NextResponse.json({
        success: true,
        orderId: paypalOrder.orderId,
        amount,
        currency: currency.toUpperCase(),
      })
    }

    return NextResponse.json(
      { success: false, message: 'No payment provider configured. Set STRIPE_SECRET_KEY or PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
