import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit, sanitizeUser } from '@/lib/security'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await rateLimit(30, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
        loginHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, user: sanitizeUser(user) })
  } catch (error) {
    console.error('Admin user detail error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    const isSuperAdmin = session.role === 'SUPER_ADMIN'

    if ('name' in body) updateData.name = body.name
    if ('nameAr' in body) updateData.nameAr = body.nameAr
    if ('language' in body) updateData.language = body.language
    if ('theme' in body) updateData.theme = body.theme

    if (isSuperAdmin) {
      if ('role' in body) updateData.role = body.role
      if ('isBanned' in body) {
        updateData.isBanned = body.isBanned
        if (body.isBanned) {
          updateData.bannedAt = new Date()
          updateData.banReason = body.banReason || null
        } else {
          updateData.bannedAt = null
          updateData.banReason = null
        }
      }
      if ('emailNotifications' in body) updateData.emailNotifications = body.emailNotifications
      if ('pushNotifications' in body) updateData.pushNotifications = body.pushNotifications
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData as any,
    })

    if ('role' in updateData && isSuperAdmin) {
      await prisma.adminLog.create({
        data: {
          adminId: session.sub,
          action: 'CHANGE_USER_ROLE',
          targetId: id,
          targetType: 'user',
          details: `Changed user ${user.email} role to ${updateData.role}`,
        },
      })
    }

    if ('isBanned' in updateData && isSuperAdmin) {
      await prisma.adminLog.create({
        data: {
          adminId: session.sub,
          action: body.isBanned ? 'BAN_USER' : 'UNBAN_USER',
          targetId: id,
          targetType: 'user',
          details: body.isBanned
            ? `Banned user: ${user.email}. Reason: ${body.banReason || 'No reason provided'}`
            : `Unbanned user: ${user.email}`,
        },
      })
    }

    return NextResponse.json({ success: true, user: sanitizeUser(user) })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
