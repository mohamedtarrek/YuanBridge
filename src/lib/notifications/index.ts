import { prisma } from '@/lib/db/prisma'
import type { NotificationPayload } from './types'
import { getEmailProvider, emailTemplates } from './email'
import { sendTelegramMessage, sendStrategyAlert, sendSubscriptionAlert } from './telegram'

function mapType(type: NotificationPayload['type']): 'STRATEGY' | 'SYSTEM' | 'BILLING' | 'ALERT' {
  return type
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        titleAr: payload.titleAr,
        message: payload.message,
        messageAr: payload.messageAr,
        type: mapType(payload.type),
        link: payload.link || null,
      },
    })
  } catch (error) {
    console.error('[Notifications] Failed to save notification to DB:', error)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        email: true,
        name: true,
        nameAr: true,
        emailNotifications: true,
        telegramNotifications: true,
        telegramChatId: true,
      },
    })

    if (!user) return

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yuanbridge.com'

    if (user.emailNotifications) {
      try {
        const emailProvider = getEmailProvider()
        const templates = emailTemplates.strategyAlert({
          name: user.name || 'Trader',
          nameAr: user.nameAr || 'متداول',
          pair: payload.title,
          direction: 'BUY',
          entry: 0,
          sl: 0,
          tp1: 0,
          tp2: 0,
          confidence: 0,
          url: payload.link || `${appUrl}/dashboard`,
        })
        await emailProvider.send({
          to: user.email,
          subject: payload.title,
          subjectAr: payload.titleAr,
          html: templates.html,
          htmlAr: templates.htmlAr,
        })
      } catch (err) {
        console.error('[Notifications] Email send failed:', err)
      }
    }

    if (user.telegramNotifications && user.telegramChatId) {
      try {
        const msg = `*${payload.title}*\n\n${payload.message}`
        await sendTelegramMessage(user.telegramChatId, msg)
      } catch (err) {
        console.error('[Notifications] Telegram send failed:', err)
      }
    }
  } catch (error) {
    console.error('[Notifications] Failed to deliver notification channels:', error)
  }
}

export async function sendBulkNotifications(payloads: NotificationPayload[]): Promise<void> {
  const results = await Promise.allSettled(
    payloads.map((p) => sendNotification(p))
  )

  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected') {
      console.error(`[Notifications] Bulk send failed for index ${i}:`, (results[i] as PromiseRejectedResult).reason)
    }
  }
}

export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  })
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
}

export async function getUserNotifications(
  userId: string,
  limit = 50,
  offset = 0
) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  })
}

export async function deleteNotification(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  })
}

export async function sendStrategyNotification(
  userId: string,
  strategy: {
    title: string
    titleAr: string
    summary: string
    summaryAr: string
    currencyPair: string
    direction: string
    entryPrice: number
    stopLoss: number
    takeProfit1: number
    takeProfit2: number
    confidence: number
    risk: string
  },
  link?: string
): Promise<void> {
  const title = `New Strategy: ${strategy.currencyPair} ${strategy.direction === 'BUY' ? '🟢' : '🔴'}`
  const titleAr = `استراتيجية جديدة: ${strategy.currencyPair} ${strategy.direction === 'BUY' ? '🟢' : '🔴'}`
  const message = `${strategy.summary}\nEntry: $${strategy.entryPrice} | SL: $${strategy.stopLoss} | TP1: $${strategy.takeProfit1} | TP2: $${strategy.takeProfit2} | Confidence: ${strategy.confidence}%`
  const messageAr = `${strategy.summaryAr}\nالدخول: $${strategy.entryPrice} | وقف الخسارة: $${strategy.stopLoss} | TP1: $${strategy.takeProfit1} | TP2: $${strategy.takeProfit2} | الثقة: ${strategy.confidence}%`

  await sendNotification({
    userId,
    title,
    titleAr,
    message,
    messageAr,
    type: 'STRATEGY',
    link,
  })
}

export async function sendBillingNotification(
  userId: string,
  subject: string,
  subjectAr: string,
  message: string,
  messageAr: string,
  link?: string
): Promise<void> {
  await sendNotification({
    userId,
    title: subject,
    titleAr: subjectAr,
    message,
    messageAr,
    type: 'BILLING',
    link,
  })
}

export async function sendSystemNotification(
  userId: string,
  title: string,
  titleAr: string,
  message: string,
  messageAr: string,
  link?: string
): Promise<void> {
  await sendNotification({
    userId,
    title,
    titleAr,
    message,
    messageAr,
    type: 'SYSTEM',
    link,
  })
}

export async function sendAlertNotification(
  userId: string,
  title: string,
  titleAr: string,
  message: string,
  messageAr: string,
  link?: string
): Promise<void> {
  await sendNotification({
    userId,
    title,
    titleAr,
    message,
    messageAr,
    type: 'ALERT',
    link,
  })
}
