import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import { z } from 'zod'

const markReadSchema = z.object({
  notificationId: z.string().min(1).optional(),
  all: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(20, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.sub },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: session.sub } }),
      prisma.notification.count({ where: { userId: session.sub, read: false } }),
    ])

    return NextResponse.json({
      success: true,
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(20, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = markReadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { notificationId, all } = validation.data

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: session.sub, read: false },
        data: { read: true },
      })
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read.',
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'notificationId or all flag is required.' },
        { status: 400 }
      )
    }

    await prisma.notification.updateMany({
      where: { id: notificationId, userId: session.sub },
      data: { read: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read.',
    })
  } catch (error) {
    console.error('Notifications PATCH error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const notificationId = searchParams.get('notificationId')
    const all = searchParams.get('all')

    if (all === 'true') {
      await prisma.notification.deleteMany({
        where: { userId: session.sub },
      })
      return NextResponse.json({
        success: true,
        message: 'All notifications deleted.',
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'notificationId query parameter or all=true is required.' },
        { status: 400 }
      )
    }

    await prisma.notification.deleteMany({
      where: { id: notificationId, userId: session.sub },
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted.',
    })
  } catch (error) {
    console.error('Notifications DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
