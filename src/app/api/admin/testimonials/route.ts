import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import { z } from 'zod'

const testimonialSchema = z.object({
  name: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  roleAr: z.string().min(1).max(100),
  content: z.string().min(1).max(2000),
  contentAr: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).default(5),
  avatar: z.string().optional(),
  active: z.boolean().default(true),
})

const testimonialUpdateSchema = testimonialSchema.partial()

import type { SessionPayload } from '@/lib/auth'

function checkAdmin(session: SessionPayload | null): boolean {
  return !!(session?.sub && (session.role === 'MODERATOR' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN'))
}

export async function GET() {
  try {
    const rateCheck = await rateLimit(30, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const testimonials = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, testimonials })
  } catch (error) {
    console.error('Testimonials GET error:', error)
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
    if (!checkAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = testimonialSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const testimonial = await prisma.testimonial.create({ data: validation.data as any })

    return NextResponse.json({ success: true, testimonial }, { status: 201 })
  } catch (error) {
    console.error('Testimonials POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!checkAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'id query parameter is required.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = testimonialUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const existing = await prisma.testimonial.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found.' },
        { status: 404 }
      )
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: validation.data as any,
    })

    return NextResponse.json({ success: true, testimonial })
  } catch (error) {
    console.error('Testimonials PUT error:', error)
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
    if (!checkAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'id query parameter is required.' },
        { status: 400 }
      )
    }

    const existing = await prisma.testimonial.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found.' },
        { status: 404 }
      )
    }

    await prisma.testimonial.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Testimonial deleted.' })
  } catch (error) {
    console.error('Testimonials DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
