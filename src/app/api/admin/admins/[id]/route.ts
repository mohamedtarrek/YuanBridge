import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await rateLimit(5, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const admin = await prisma.user.findUnique({ where: { id } })
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin not found.' },
        { status: 404 }
      )
    }

    if (admin.role === 'SUPER_ADMIN' && id !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify another Super Admin.' },
        { status: 403 }
      )
    }

    if ('role' in body) {
      await prisma.user.update({
        where: { id },
        data: { role: body.role },
      })

      await prisma.adminLog.create({
        data: {
          adminId: session.user.id,
          action: 'CHANGE_USER_ROLE',
          targetId: id,
          targetType: 'admin',
          details: `Changed admin ${admin.email} role to ${body.role}`,
        },
      })
    }

    if ('isActive' in body || 'isPermanent' in body || 'expiresAt' in body) {
      const profileData: Record<string, unknown> = {}
      if ('isActive' in body) profileData.isActive = body.isActive
      if ('isPermanent' in body) profileData.isPermanent = body.isPermanent
      if ('expiresAt' in body) profileData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

      await prisma.adminProfile.upsert({
        where: { userId: id },
        update: profileData as any,
        create: {
          userId: id,
          ...profileData,
          createdBy: session.user.id,
        } as any,
      })

      if ('isActive' in body) {
        const action = body.isActive ? 'ACTIVATE_ADMIN' : 'SUSPEND_ADMIN'
        await prisma.adminLog.create({
          data: {
            adminId: session.user.id,
            action,
            targetId: id,
            targetType: 'admin',
            details: body.isActive
              ? `Activated admin: ${admin.email}`
              : `Suspended admin: ${admin.email}`,
          },
        })
      }
    }

    const updated = await prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    })
    const { password: _, ...safeAdmin } = updated!

    return NextResponse.json({ success: true, admin: safeAdmin })
  } catch (error) {
    console.error('Admin update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await rateLimit(5, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      )
    }

    const { id } = await params

    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account.' },
        { status: 400 }
      )
    }

    const admin = await prisma.user.findUnique({ where: { id } })
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found.' },
        { status: 404 }
      )
    }

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'DELETE_ADMIN',
        targetId: id,
        targetType: 'admin',
        details: `Deleted admin: ${admin.email}`,
      },
    })

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Admin deleted.' })
  } catch (error) {
    console.error('Admin delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
