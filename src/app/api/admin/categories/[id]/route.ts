import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit, validateInput, categorySchema } from '@/lib/security'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const { id } = await params

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Category not found.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validation = validateInput(categorySchema.partial(), body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data as Record<string, unknown>
    const updateData: Record<string, unknown> = {}

    const allowedFields = ['name', 'nameAr', 'slug', 'description', 'descriptionAr', 'image', 'order', 'isActive']
    for (const field of allowedFields) {
      if (field in data) updateData[field] = data[field]
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData as any,
    })

    await prisma.adminLog.create({
      data: {
        adminId: session.sub,
        action: 'UPDATE_CATEGORY',
        targetId: id,
        targetType: 'category',
        details: `Updated category: ${category.name}`,
      },
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error('Category update error:', error)
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
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const { id } = await params

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Category not found.' },
        { status: 404 }
      )
    }

    await prisma.category.delete({ where: { id } })

    await prisma.adminLog.create({
      data: {
        adminId: session.sub,
        action: 'DELETE_CATEGORY',
        targetId: id,
        targetType: 'category',
        details: `Deleted category: ${existing.name}`,
      },
    })

    return NextResponse.json({ success: true, message: 'Category deleted.' })
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
