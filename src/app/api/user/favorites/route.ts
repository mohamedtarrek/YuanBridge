import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import { z } from 'zod'

const favoriteSchema = z.object({
  strategyId: z.string().min(1),
})

export async function GET() {
  try {
    const rateCheck = await rateLimit(20, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { strategy: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      favorites: favorites.map((f) => f.strategy),
    })
  } catch (error) {
    console.error('Favorites GET error:', error)
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = favoriteSchema.safeParse(body)
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

    const existing = await prisma.favorite.findUnique({
      where: { userId_strategyId: { userId: session.user.id, strategyId } },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Strategy is already in favorites.' },
        { status: 409 }
      )
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        strategyId,
      },
      include: { strategy: true },
    })

    return NextResponse.json({ success: true, strategy: favorite.strategy }, { status: 201 })
  } catch (error) {
    console.error('Favorites POST error:', error)
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
    if (!session?.user?.id) {
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

    await prisma.favorite.deleteMany({
      where: { userId: session.user.id, strategyId },
    })

    return NextResponse.json({ success: true, message: 'Removed from favorites.' })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
