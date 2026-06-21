import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit, validateInput, categorySchema } from '@/lib/security'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { strategies: true } } },
    })

    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error('Categories list error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = validateInput(categorySchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    const category = await prisma.category.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        slug: data.slug,
        description: data.description || null,
        descriptionAr: data.descriptionAr || null,
        image: data.image || null,
        order: data.order,
        isActive: data.isActive,
      },
    })

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'CREATE_CATEGORY',
        targetId: category.id,
        targetType: 'category',
        details: `Created category: ${category.name}`,
      },
    })

    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
