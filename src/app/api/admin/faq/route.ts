import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import { z } from 'zod'

const faqSchema = z.object({
  question: z.string().min(1).max(500),
  questionAr: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
  answerAr: z.string().min(1).max(5000),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
})

const faqUpdateSchema = faqSchema.partial()

import type { SessionPayload } from '@/lib/auth'

function checkAdmin(session: SessionPayload | null): boolean {
  return !!(session?.sub && session.role === 'ADMIN')
}

export async function GET() {
  try {
    const rateCheck = await rateLimit(30, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const faqs = await prisma.fAQ.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, faqs })
  } catch (error) {
    console.error('FAQ GET error:', error)
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
    const validation = faqSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const faq = await prisma.fAQ.create({ data: validation.data as any })

    return NextResponse.json({ success: true, faq }, { status: 201 })
  } catch (error) {
    console.error('FAQ POST error:', error)
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
    const validation = faqUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const existing = await prisma.fAQ.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'FAQ not found.' },
        { status: 404 }
      )
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: validation.data as any,
    })

    return NextResponse.json({ success: true, faq })
  } catch (error) {
    console.error('FAQ PUT error:', error)
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

    const existing = await prisma.fAQ.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'FAQ not found.' },
        { status: 404 }
      )
    }

    await prisma.fAQ.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'FAQ deleted.' })
  } catch (error) {
    console.error('FAQ DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
