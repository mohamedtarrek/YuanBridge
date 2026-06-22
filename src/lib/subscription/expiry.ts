import { prisma } from '@/lib/db'

export async function checkExpiredSubscriptions(): Promise<number> {
  const now = new Date()

  const expired = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      endsAt: { lte: now },
      plan: { not: 'LIFETIME' },
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  if (expired.length === 0) return 0

  await prisma.subscription.updateMany({
    where: {
      id: { in: expired.map(s => s.id) },
    },
    data: {
      status: 'EXPIRED',
    },
  })

  await prisma.notification.createMany({
    data: expired.map(sub => ({
      userId: sub.userId,
      title: 'Subscription Expired',
      titleAr: 'انتهت الاشتراك',
      message: `Your ${sub.plan.toLowerCase()} subscription has expired. Renew now to regain access to premium features.`,
      messageAr: `انتهت اشتراكك ${sub.plan === 'MONTHLY' ? 'الشهري' : sub.plan === 'QUARTERLY' ? 'الربع سنوي' : sub.plan === 'YEARLY' ? 'السنوي' : ''}. جدد الآن لاستعادة الوصول إلى الميزات المميزة.`,
      type: 'BILLING',
      link: '/pricing',
    })),
  })

  return expired.length
}

export async function checkExpiringSoon(daysBefore: number = 7): Promise<number> {
  const now = new Date()
  const threshold = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000)

  const expiring = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      endsAt: {
        gte: now,
        lte: threshold,
      },
      plan: { notIn: ['FREE', 'LIFETIME'] },
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  if (expiring.length === 0) return 0

  for (const sub of expiring) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: sub.userId,
        type: 'BILLING',
        message: { contains: sub.plan },
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    })
    if (existingNotification) continue

    const daysLeft = Math.ceil((sub.endsAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

    await prisma.notification.create({
      data: {
        userId: sub.userId,
        title: 'Subscription Expiring Soon',
        titleAr: 'الاشتراك على وشك الانتهاء',
        message: `Your ${sub.plan.toLowerCase()} subscription will expire in ${daysLeft} days. Renew to avoid interruption.`,
        messageAr: `سينتهي اشتراكك ${sub.plan === 'MONTHLY' ? 'الشهري' : sub.plan === 'QUARTERLY' ? 'الربع سنوي' : sub.plan === 'YEARLY' ? 'السنوي' : ''} خلال ${daysLeft} أيام. جدد لتجنب انقطاع الخدمة.`,
        type: 'BILLING',
        link: '/pricing',
      },
    })
  }

  return expiring.length
}

export async function isPremiumActive(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, endsAt: true },
  })

  if (!sub) return false
  if (sub.plan === 'FREE') return false
  if (sub.status !== 'ACTIVE' && sub.status !== 'TRIALING') return false
  if (sub.plan === 'LIFETIME') return true
  if (sub.endsAt && sub.endsAt < new Date()) {
    await prisma.subscription.update({
      where: { userId },
      data: { status: 'EXPIRED' },
    })
    return false
  }
  return true
}
