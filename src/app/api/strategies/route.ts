import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(30, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    let isPremium = false
    if (session?.sub) {
      const sub = await prisma.subscription.findUnique({
        where: { userId: session.sub },
        select: { plan: true, status: true },
      })
      isPremium = sub?.plan === 'PREMIUM' && sub?.status === 'ACTIVE'
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const direction = searchParams.get('direction') as 'BUY' | 'SELL' | null
    const risk = searchParams.get('risk') as 'LOW' | 'MEDIUM' | 'HIGH' | null
    const filterPremium = searchParams.get('isPremium')
    const currencyPair = searchParams.get('currencyPair')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') as 'newest' | 'oldest' | 'highest_confidence' | 'lowest_confidence' | null

    const where: Prisma.StrategyWhereInput = {
      status: 'PUBLISHED',
    }

    if (!isPremium) {
      where.isPremium = false
    } else if (filterPremium !== null) {
      where.isPremium = filterPremium === 'true'
    }

    if (direction) {
      where.direction = direction
    }

    if (risk) {
      where.risk = risk
    }

    if (currencyPair) {
      where.currencyPair = { contains: currencyPair }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { currencyPair: { contains: search } },
      ]
    }

    let orderBy: Prisma.StrategyOrderByWithRelationInput = { createdAt: 'desc' }
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'highest_confidence':
        orderBy = { confidence: 'desc' }
        break
      case 'lowest_confidence':
        orderBy = { confidence: 'asc' }
        break
    }

    const [strategies, total] = await Promise.all([
      prisma.strategy.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, nameAr: true } },
        },
      }),
      prisma.strategy.count({ where }),
    ])

    return NextResponse.json({
      strategies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Strategies list error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
