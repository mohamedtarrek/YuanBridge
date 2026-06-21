import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit, sanitizeUser } from '@/lib/security'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  nameAr: z.string().min(2).max(100).optional(),
  language: z.enum(['ar', 'en']).optional(),
  theme: z.enum(['dark', 'light']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  telegramNotifications: z.boolean().optional(),
  telegramChatId: z.string().optional(),
})

export async function GET() {
  try {
    const rateCheck = await rateLimit(20, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      )
    }

    const safeUser = sanitizeUser(user)

    return NextResponse.json({ success: true, user: { ...safeUser, subscription: user.subscription } })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = updateProfileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: data as any,
    })

    const safeUser = sanitizeUser(user)

    return NextResponse.json({ success: true, user: safeUser })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
