import { NextResponse } from 'next/server'
import { handlePayPalWebhook } from '@/lib/payment'

const PAYPAL_SANDBOX = 'https://api-m.sandbox.paypal.com'
const PAYPAL_LIVE = 'https://api-m.paypal.com'

async function verifyPaypalWebhook(
  headers: Headers,
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return true

  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) return true

  const authHeader = headers.get('authorization') || ''
  const transmitId = headers.get('paypal-transmission-id') || ''
  const transmitTime = headers.get('paypal-transmission-time') || ''
  const certUrl = headers.get('paypal-cert-url') || ''
  const authAlgo = headers.get('paypal-auth-algo') || ''

  const base = process.env.NODE_ENV === 'production' ? PAYPAL_LIVE : PAYPAL_SANDBOX

  const accessTokenRes = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!accessTokenRes.ok) return false
  const tokenData = await accessTokenRes.json()
  const accessToken = tokenData.access_token

  const verifyRes = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmitId,
      transmission_sig: authHeader,
      transmission_time: transmitTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  })

  if (!verifyRes.ok) return false
  const result = await verifyRes.json()
  return result.verification_status === 'SUCCESS'
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headers = request.headers

    const isValid = await verifyPaypalWebhook(headers, body)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    await handlePayPalWebhook(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
