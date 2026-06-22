import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'

export async function GET() {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || (session.role !== 'MODERATOR' && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.sub,
        read: false,
      },
    })

    const recent = await prisma.notification.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      notifications: recent,
      unreadCount,
    })
  } catch (error) {
    console.error('Admin notifications error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.sub || (session.role !== 'MODERATOR' && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { notificationId, markAll } = body

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.sub, read: false },
        data: { read: true },
      })
    } else if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin notification update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
