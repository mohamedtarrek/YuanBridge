import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit, validateInput, adminStrategySchema } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(30, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.sub || (session.role !== 'MODERATOR' && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Staff access required.' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const status = searchParams.get('status')
    const direction = searchParams.get('direction')
    const risk = searchParams.get('risk')
    const currencyPair = searchParams.get('currencyPair')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (direction) where.direction = direction
    if (risk) where.risk = risk
    if (currencyPair) where.currencyPair = { contains: currencyPair }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleAr: { contains: search } },
        { currencyPair: { contains: search } },
        { description: { contains: search } },
      ]
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' }
    switch (sort) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break
      case 'highest_confidence': orderBy = { confidence: 'desc' }; break
      case 'lowest_confidence': orderBy = { confidence: 'asc' }; break
      case 'title_asc': orderBy = { title: 'asc' }; break
      case 'title_desc': orderBy = { title: 'desc' }; break
    }

    const [strategies, total] = await Promise.all([
      prisma.strategy.findMany({
        where: where as any,
        orderBy: orderBy as any,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, nameAr: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.strategy.count({ where: where as any }),
    ])

    return NextResponse.json({
      success: true,
      strategies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Admin strategies list error:', error)
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
    if (!session?.sub || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = validateInput(adminStrategySchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 200)
    }

    const strategy = await prisma.strategy.create({
      data: {
        title: data.title,
        titleAr: data.titleAr || null,
        slug: data.slug,
        description: data.description || null,
        descriptionAr: data.descriptionAr || null,
        currencyPair: data.currencyPair,
        direction: data.direction as any,
        entryPrice: data.entryPrice,
        stopLoss: data.stopLoss,
        takeProfit1: data.takeProfit1,
        takeProfit2: data.takeProfit2 || null,
        takeProfit3: data.takeProfit3 || null,
        risk: data.risk as any,
        riskPercent: data.riskPercent || null,
        riskReward: data.riskReward || null,
        confidence: data.confidence,
        status: data.status as any,
        isPremium: data.isPremium,
        image: data.image || null,
        tags: data.tags || null,
        categoryId: data.categoryId || null,
        createdById: session.sub,
        summary: data.summary || null,
        summaryAr: data.summaryAr || null,
        trend: data.trend as any || null,
        support1: data.support1 || null,
        support2: data.support2 || null,
        support3: data.support3 || null,
        resistance1: data.resistance1 || null,
        resistance2: data.resistance2 || null,
        resistance3: data.resistance3 || null,
        technicalAnalysis: data.technicalAnalysis || null,
        technicalAnalysisAr: data.technicalAnalysisAr || null,
        fundamentalAnalysis: data.fundamentalAnalysis || null,
        fundamentalAnalysisAr: data.fundamentalAnalysisAr || null,
        rsi: data.rsi || null,
        macdValue: data.macdValue || null,
        macdSignal: data.macdSignal || null,
        macdHistogram: data.macdHistogram || null,
        emaFast: data.emaFast || null,
        emaSlow: data.emaSlow || null,
        smaPeriod: data.smaPeriod || null,
        smaValue: data.smaValue || null,
        atr: data.atr || null,
        bbUpper: data.bbUpper || null,
        bbMiddle: data.bbMiddle || null,
        bbLower: data.bbLower || null,
        adx: data.adx || null,
        cci: data.cci || null,
        notes: data.notes || null,
        notesAr: data.notesAr || null,
        winRate: data.winRate || null,
        analysis: data.analysis || null,
        tradingRules: data.tradingRules || null,
        publishedAt: data.status === 'PUBLISHED' || data.status === 'FEATURED' ? new Date() : null,
      },
    })

    await prisma.adminLog.create({
      data: {
        adminId: session.sub,
        action: 'CREATE_STRATEGY',
        targetId: strategy.id,
        targetType: 'strategy',
        details: `Created strategy: ${strategy.title}`,
      },
    })

    return NextResponse.json({ success: true, strategy }, { status: 201 })
  } catch (error) {
    console.error('Admin strategy create error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
