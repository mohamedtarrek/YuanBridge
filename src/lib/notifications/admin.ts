import { prisma } from '@/lib/db'
import type { NotificationType } from '@prisma/client'

interface AdminNotificationInput {
  userId: string
  title: string
  titleAr: string
  message: string
  messageAr: string
  type: NotificationType
  link?: string
}

export async function createAdminNotification(data: AdminNotificationInput): Promise<void> {
  await prisma.notification.create({ data })
}

export async function notifyAllAdmins(
  title: string,
  titleAr: string,
  message: string,
  messageAr: string,
  type: NotificationType = 'SYSTEM',
  link?: string
): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true },
  })

  if (admins.length === 0) return

  await prisma.notification.createMany({
    data: admins.map(a => ({
      userId: a.id,
      title,
      titleAr,
      message,
      messageAr,
      type,
      link: link || null,
    })),
  })
}

export async function notifyNewRegistration(userId: string, userName: string): Promise<void> {
  await notifyAllAdmins(
    'New User Registration',
    'تسجيل مستخدم جديد',
    `New user "${userName}" has registered on the platform.`,
    `المستخدم "${userName}" سجل في المنصة.`,
    'SYSTEM',
    `/admin/users/${userId}`
  )
}

export async function notifySubscriptionEvent(
  userId: string,
  userName: string,
  event: 'expired' | 'expiring' | 'upgraded' | 'downgraded' | 'cancelled',
  details?: string
): Promise<void> {
  const titles: Record<string, { en: string; ar: string }> = {
    expired: { en: 'Subscription Expired', ar: 'انتهاء الاشتراك' },
    expiring: { en: 'Subscription Expiring Soon', ar: 'اشتراك على وشك الانتهاء' },
    upgraded: { en: 'Subscription Upgraded', ar: 'ترقية الاشتراك' },
    downgraded: { en: 'Subscription Downgraded', ar: 'تخفيض الاشتراك' },
    cancelled: { en: 'Subscription Cancelled', ar: 'إلغاء الاشتراك' },
  }

  const t = titles[event]
  if (!t) return

  await notifyAllAdmins(
    t.en,
    t.ar,
    `User "${userName}" subscription ${event}.${details ? ' ' + details : ''}`,
    `اشتراك المستخدم "${userName}" ${event === 'expired' ? 'انتهى' : event === 'expiring' ? 'على وشك الانتهاء' : event === 'upgraded' ? 'تم ترقيته' : event === 'downgraded' ? 'تم تخفيضه' : 'تم إلغاؤه'}.${details ? ' ' + details : ''}`,
    'BILLING',
    `/admin/users/${userId}`
  )
}

export async function notifyStrategyEvent(
  strategyId: string,
  strategyTitle: string,
  event: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished',
  adminName: string
): Promise<void> {
  const titles: Record<string, { en: string; ar: string }> = {
    created: { en: 'Strategy Created', ar: 'إنشاء استراتيجية' },
    updated: { en: 'Strategy Updated', ar: 'تحديث استراتيجية' },
    deleted: { en: 'Strategy Deleted', ar: 'حذف استراتيجية' },
    published: { en: 'Strategy Published', ar: 'نشر استراتيجية' },
    unpublished: { en: 'Strategy Unpublished', ar: 'إلغاء نشر استراتيجية' },
  }

  const t = titles[event]
  if (!t) return

  await notifyAllAdmins(
    t.en,
    t.ar,
    `"${adminName}" ${event} strategy: "${strategyTitle}"`,
    `"${adminName}" ${event === 'created' ? 'أنشأ' : event === 'updated' ? 'حدث' : event === 'deleted' ? 'حذف' : event === 'published' ? 'نشر' : 'ألغى نشر'} استراتيجية: "${strategyTitle}"`,
    'STRATEGY',
    `/admin/strategies/${strategyId}`
  )
}
