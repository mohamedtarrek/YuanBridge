import type { NotificationPayload } from './types'

function getVapidKeys(): { subject: string; publicKey: string; privateKey: string } | null {
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@yuanbridge.com'
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) {
    return null
  }
  return { subject, publicKey, privateKey }
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<void> {
  const vapid = getVapidKeys()
  if (!vapid) {
    console.warn('[Push] VAPID keys not configured, skipping push notification')
    return
  }

  let webpush: any
  try {
    webpush = await import('web-push')
  } catch {
    console.warn('[Push] web-push not installed, skipping push notification')
    return
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: payload.title,
      body: payload.message,
      icon: '/icon.png',
      badge: '/badge.png',
      data: {
        type: payload.type,
        link: payload.link,
        url: payload.link || '/dashboard',
      },
    })
  )
}

export async function sendToAll(
  subscriptions: PushSubscription[],
  payload: NotificationPayload
): Promise<void> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  )

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'rejected') {
      console.error(`[Push] Failed to send to subscription ${i}:`, result.reason)
    }
  }
}
