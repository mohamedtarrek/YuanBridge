import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { registerSchema } from '@/lib/auth'
import { rateLimit, sanitizeUser } from '@/lib/security'
import { notifyNewRegistration } from '@/lib/notifications/admin'

export async function POST(request: Request) {
  try {
    const rateCheck = await rateLimit(5, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.')
        if (!errors[path]) errors[path] = []
        errors[path].push(issue.message)
      }
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        language: 'ar',
        theme: 'dark',
        subscription: {
          create: {
            plan: 'FREE',
            status: 'TRIALING',
          },
        },
      },
    })

    await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to YuanBridge!',
          titleAr: 'مرحباً بك في يوانبريدج!',
          message: 'Your account has been created. Explore our strategies and start your trading journey.',
          messageAr: 'تم إنشاء حسابك. استكشف استراتيجياتنا وابدأ رحلة التداول الخاصة بك.',
          type: 'SYSTEM',
          link: '/strategies',
        },
      }),
      notifyNewRegistration(user.id, name || email),
    ])

    return NextResponse.json(
      { success: true, message: 'Account created successfully.', user: sanitizeUser(user) },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
