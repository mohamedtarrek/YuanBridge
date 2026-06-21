import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { handleStripeWebhook } from '@/lib/payment'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (webhookSecret) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-05-27.dahlia',
      })
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      await handleStripeWebhook(event)
    } else {
      const event = JSON.parse(body)
      await handleStripeWebhook(event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
