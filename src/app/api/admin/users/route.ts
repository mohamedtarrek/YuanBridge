import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit, sanitizeUser } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const isBanned = searchParams.get('isBanned')
    const sort = searchParams.get('sort') || 'newest'

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (role) where.role = role
    if (isBanned !== null) where.isBanned = isBanned === 'true'

    let orderBy: Record<string, string> = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    if (sort === 'name_asc') orderBy = { name: 'asc' }
    if (sort === 'name_desc') orderBy = { name: 'desc' }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as any,
        orderBy: orderBy as any,
        skip: (page - 1) * limit,
        take: limit,
        include: { subscription: true },
      }),
      prisma.user.count({ where: where as any }),
    ])

    const safeUsers = users.map((u) => ({
      ...sanitizeUser(u),
      subscription: u.subscription,
    }))

    return NextResponse.json({
      success: true,
      users: safeUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId query parameter is required.' },
        { status: 400 }
      )
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account.' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      )
    }

    await prisma.user.delete({ where: { id: userId } })

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'DELETE_USER',
        targetId: userId,
        targetType: 'user',
        details: `Deleted user: ${existing.email}`,
      },
    })

    return NextResponse.json({ success: true, message: 'User deleted.' })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
