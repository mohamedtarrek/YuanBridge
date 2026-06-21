import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit, validateInput, strategySchema } from '@/lib/security'
import type { Prisma } from '@/generated/prisma'
import { generateStrategy } from '@/lib/ai/engine'

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(30, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    const isPremium = session?.user?.role === 'PREMIUM' || false

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const direction = searchParams.get('direction') as 'BUY' | 'SELL' | null
    const risk = searchParams.get('risk') as 'LOW' | 'MEDIUM' | 'HIGH' | null
    const filterPremium = searchParams.get('isPremium')
    const currencyPair = searchParams.get('currencyPair')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') as 'newest' | 'oldest' | 'highest_confidence' | 'lowest_confidence' | null
    const approved = searchParams.get('approved')

    const where: Prisma.StrategyWhereInput = {
      isPublished: true,
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

    if (approved !== null) {
      where.isApproved = approved === 'true'
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = validateInput(strategySchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const strategy = await prisma.strategy.create({
      data: {
        title: data.title,
        titleAr: data.titleAr,
        currencyPair: data.currencyPair,
        direction: data.direction as any,
        entryPrice: data.entryPrice,
        stopLoss: data.stopLoss,
        takeProfit1: data.takeProfit1,
        takeProfit2: data.takeProfit2,
        risk: data.risk as any,
        confidence: data.confidence,
        summary: data.summary,
        summaryAr: data.summaryAr,
        isPremium: data.isPremium,
        trend: data.trend as any,
        isPublished: true,
        isApproved: true,
        publishedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, strategy }, { status: 201 })
  } catch (error) {
    console.error('Strategy create error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
