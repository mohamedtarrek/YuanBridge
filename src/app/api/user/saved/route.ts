import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import { z } from 'zod'

const savedSchema = z.object({
  strategyId: z.string().min(1),
})

export async function GET() {
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

    const saved = await prisma.savedStrategy.findMany({
      where: { userId: session.sub },
      include: { strategy: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      strategies: saved.map((s) => s.strategy),
    })
  } catch (error) {
    console.error('Saved GET error:', error)
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
    if (!session?.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = savedSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { strategyId } = validation.data

    const strategy = await prisma.strategy.findUnique({ where: { id: strategyId } })
    if (!strategy) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found.' },
        { status: 404 }
      )
    }

    const existing = await prisma.savedStrategy.findUnique({
      where: { userId_strategyId: { userId: session.sub, strategyId } },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Strategy is already saved.' },
        { status: 409 }
      )
    }

    const saved = await prisma.savedStrategy.create({
      data: {
        userId: session.sub,
        strategyId,
      },
      include: { strategy: true },
    })

    return NextResponse.json({ success: true, strategy: saved.strategy }, { status: 201 })
  } catch (error) {
    console.error('Saved POST error:', error)
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
    const strategyId = searchParams.get('strategyId')
    if (!strategyId) {
      return NextResponse.json(
        { success: false, message: 'strategyId query parameter is required.' },
        { status: 400 }
      )
    }

    await prisma.savedStrategy.deleteMany({
      where: { userId: session.sub, strategyId },
    })

    return NextResponse.json({ success: true, message: 'Unsaved strategy.' })
  } catch (error) {
    console.error('Saved DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
