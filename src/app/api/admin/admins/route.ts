import { NextRequest, NextResponse } from 'next/server'
import { auth, requireSuperAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    await requireSuperAdmin()

    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
      },
      include: {
        adminProfile: true,
        _count: {
          select: { adminLogs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const safeAdmins = admins.map((a) => {
      const { password: _, ...safe } = a
      return safe
    })

    return NextResponse.json({ success: true, admins: safeAdmins })
  } catch (error) {
    console.error('Admin list error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(5, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, isPermanent, expiresAt } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required.' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        adminProfile: {
          create: {
            isActive: true,
            isPermanent: isPermanent !== false,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdBy: session.sub,
          },
        },
      },
    })

    await prisma.adminLog.create({
      data: {
        adminId: session.sub,
        action: 'CREATE_ADMIN',
        targetId: admin.id,
        targetType: 'admin',
        details: `Created admin: ${admin.email} (Permanent: ${isPermanent !== false ? 'Yes' : 'No'})`,
      },
    })

    const { password: _, ...safeAdmin } = admin

    return NextResponse.json({ success: true, admin: safeAdmin }, { status: 201 })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
