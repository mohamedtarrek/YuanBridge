import Stripe from 'stripe'
import type { Payment } from '@/lib/types'
import { prisma } from '@/lib/db'

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
}

const PAYPAL_API = process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
  ? 'https://api-m.paypal.com'
  : null

const PAYPAL_SANDBOX = 'https://api-m.sandbox.paypal.com'

function getPaypalBase(): string {
  if (!PAYPAL_API) return PAYPAL_SANDBOX
  return PAYPAL_API
}

async function getPaypalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) return null

  const base = getPaypalBase()
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) return null
  const data = await response.json()
  return data.access_token ?? null
}

export async function createCheckoutSession(
  priceId: string,
  userId: string
): Promise<{ url: string }> {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.')
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId },
  })

  return { url: session.url! }
}

export async function createPayPalOrder(
  userId: string
): Promise<{ orderId: string }> {
  const accessToken = await getPaypalAccessToken()
  if (!accessToken) {
    throw new Error('PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in environment variables.')
  }

  const base = getPaypalBase()
  const response = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: '12.00' },
        description: 'YuanBridge Premium Subscription',
        custom_id: userId,
      }],
    }),
  })

  if (!response.ok) {
    throw new Error(`PayPal API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return { orderId: data.id }
}

export async function handleStripeWebhook(event: any): Promise<void> {
  const { type, data: { object } } = event

  switch (type) {
    case 'checkout.session.completed': {
      const session = object as Stripe.Checkout.Session
      const userId = session.metadata?.userId || session.client_reference_id
      if (!userId) return

      const subscription = await fetchSubscriptionFromDb(userId)
      if (subscription) {
        await updateSubscription(subscription.id, {
          plan: 'PREMIUM',
          status: 'ACTIVE',
          stripeSubId: session.subscription as string,
          stripeId: session.id,
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
      }

      await createPayment({
        userId,
        subscriptionId: subscription?.id || 'unknown',
        amount: session.amount_total ? session.amount_total / 100 : 12,
        currency: session.currency?.toUpperCase() || 'USD',
        status: 'SUCCEEDED',
        provider: 'STRIPE',
        providerId: session.id,
      })
      break
    }

    case 'invoice.paid': {
      const invoice = object as any
      const subId = invoice.subscription_details?.subscription || invoice.subscription
      if (!subId) return

      const subscription = await findSubscriptionByStripeSubId(subId)
      if (subscription) {
        await updateSubscription(subscription.id, {
          status: 'ACTIVE',
          endsAt: new Date(invoice.period_end * 1000 || Date.now()),
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = object as Stripe.Subscription
      const subscription = await findSubscriptionByStripeSubId(sub.id)
      if (subscription) {
        await updateSubscription(subscription.id, {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        })
      }
      break
    }
  }
}

export async function handlePayPalWebhook(event: any): Promise<void> {
  const { event_type, resource } = event

  switch (event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const customId = resource.custom_id
      if (!customId) return

      const subscription = await fetchSubscriptionFromDb(customId)
      if (subscription) {
        await updateSubscription(subscription.id, {
          plan: 'PREMIUM',
          status: 'ACTIVE',
          paypalSubId: resource.billing_agreement_id || resource.id,
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
      }

      await createPayment({
        userId: customId,
        subscriptionId: subscription?.id || 'unknown',
        amount: parseFloat(resource.amount?.value || '12'),
        currency: resource.amount?.currency_code || 'USD',
        status: 'SUCCEEDED',
        provider: 'PAYPAL',
        providerId: resource.id,
      })
      break
    }

    case 'BILLING.SUBSCRIPTION.CANCELLED': {
      const subId = resource.id
      const subscription = await findSubscriptionByPaypalSubId(subId)
      if (subscription) {
        await updateSubscription(subscription.id, {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        })
      }
      break
    }
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const stripe = getStripe()

  const subscription = await findSubscriptionById(subscriptionId)
  if (!subscription) throw new Error('Subscription not found')

  if (subscription.stripeSubId && stripe) {
    await stripe.subscriptions.update(subscription.stripeSubId, {
      cancel_at_period_end: true,
    })
  }

  await updateSubscription(subscriptionId, {
    status: 'CANCELLED',
    cancelledAt: new Date(),
  })
}

export async function getBillingHistory(userId: string): Promise<Payment[]> {
  return listPaymentsByUser(userId)
}

export async function createInvoice(paymentId: string): Promise<string> {
  const payment = await findPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found')

  if (payment.invoiceUrl) return payment.invoiceUrl

  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/invoice/${paymentId}`
  return invoiceUrl
}

export async function checkSubscriptionStatus(
  userId: string
): Promise<{ active: boolean; plan: string; endsAt: Date | null }> {
  const subscription = await fetchSubscriptionFromDb(userId)

  if (!subscription) {
    return { active: false, plan: 'free', endsAt: null }
  }

  const active = subscription.status === 'ACTIVE' || subscription.status === 'TRIALING'
  return {
    active,
    plan: subscription.plan.toLowerCase(),
    endsAt: subscription.endsAt,
  }
}

export async function upgradeSubscription(userId: string, plan: string): Promise<void> {
  const subscription = await fetchSubscriptionFromDb(userId)
  if (subscription) {
    await updateSubscription(subscription.id, {
      plan: plan.toUpperCase() as any,
      status: 'ACTIVE',
      startedAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
  }
}

export async function downgradeSubscription(userId: string): Promise<void> {
  const subscription = await fetchSubscriptionFromDb(userId)
  if (subscription) {
    await updateSubscription(subscription.id, {
      plan: 'FREE',
      status: 'ACTIVE',
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
  }
}

async function fetchSubscriptionFromDb(userId: string): Promise<any | null> {
  try {
    return prisma.subscription.findUnique({ where: { userId } })
  } catch {
    return null
  }
}

async function findSubscriptionById(id: string): Promise<any | null> {
  try {
    return prisma.subscription.findUnique({ where: { id } })
  } catch {
    return null
  }
}

async function findSubscriptionByStripeSubId(stripeSubId: string): Promise<any | null> {
  try {
    return prisma.subscription.findFirst({ where: { stripeSubId } })
  } catch {
    return null
  }
}

async function findSubscriptionByPaypalSubId(paypalSubId: string): Promise<any | null> {
  try {
    return prisma.subscription.findFirst({ where: { paypalSubId } })
  } catch {
    return null
  }
}

async function updateSubscription(id: string, data: any): Promise<void> {
  try {
    await prisma.subscription.update({ where: { id }, data })
  } catch {
    // DB not available, skip
  }
}

async function createPayment(data: {
  userId: string
  subscriptionId: string
  amount: number
  currency: string
  status: string
  provider: string
  providerId: string
}): Promise<void> {
  try {
    await prisma.payment.create({ data: data as any })
  } catch {
    // DB not available, skip
  }
}

async function listPaymentsByUser(userId: string): Promise<Payment[]> {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return payments.map((p: any) => ({
      id: p.id,
      userId: p.userId,
      subscriptionId: p.subscriptionId,
      amount: p.amount,
      currency: p.currency,
      status: p.status.toLowerCase(),
      provider: p.provider.toLowerCase(),
      createdAt: p.createdAt.toISOString(),
    }))
  } catch {
    return []
  }
}

async function findPaymentById(id: string): Promise<any | null> {
  try {
    return prisma.payment.findUnique({ where: { id } })
  } catch {
    return null
  }
}
