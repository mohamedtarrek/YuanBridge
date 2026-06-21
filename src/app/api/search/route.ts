import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(20, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    const isPremium = session?.user?.role === 'PREMIUM' || false

    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const direction = searchParams.get('direction') as 'BUY' | 'SELL' | null
    const risk = searchParams.get('risk') as 'LOW' | 'MEDIUM' | 'HIGH' | null
    const minConfidence = searchParams.get('minConfidence')
    const maxConfidence = searchParams.get('maxConfidence')
    const currencyPair = searchParams.get('currencyPair')
    const excludePremium = searchParams.get('excludePremium')
    const sort = searchParams.get('sort') as 'newest' | 'oldest' | 'highest_confidence' | 'lowest_confidence' | null

    const where: Prisma.StrategyWhereInput = {
      isPublished: true,
    }

    if (!isPremium || excludePremium === 'true') {
      where.isPremium = false
    }

    const searchConditions: Prisma.StrategyWhereInput[] = []

    if (q) {
      searchConditions.push({
        OR: [
          { title: { contains: q } },
          { summary: { contains: q } },
          { currencyPair: { contains: q } },
        ],
      })
    }

    if (currencyPair) {
      searchConditions.push({ currencyPair: { contains: currencyPair } })
    }

    if (direction) {
      searchConditions.push({ direction })
    }

    if (risk) {
      searchConditions.push({ risk })
    }

    if (minConfidence || maxConfidence) {
      const confidenceFilter: Prisma.FloatFilter = {}
      if (minConfidence) confidenceFilter.gte = parseFloat(minConfidence)
      if (maxConfidence) confidenceFilter.lte = parseFloat(maxConfidence)
      searchConditions.push({ confidence: confidenceFilter })
    }

    if (searchConditions.length > 0) {
      where.AND = searchConditions
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
      }),
      prisma.strategy.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      strategies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query: q || null,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
