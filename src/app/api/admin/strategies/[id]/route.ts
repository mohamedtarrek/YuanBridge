import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit, validateInput, adminStrategySchema } from '@/lib/security'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await rateLimit(30, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const { id } = await params

    const strategy = await prisma.strategy.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, nameAr: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    if (!strategy) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, strategy })
  } catch (error) {
    console.error('Admin strategy detail error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const existing = await prisma.strategy.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validation = validateInput(adminStrategySchema.partial(), body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data as Record<string, unknown>
    const updateData: Record<string, unknown> = {}

    const allowedFields = [
      'title', 'titleAr', 'slug', 'description', 'descriptionAr',
      'currencyPair', 'direction', 'entryPrice', 'stopLoss',
      'takeProfit1', 'takeProfit2', 'takeProfit3',
      'risk', 'riskPercent', 'riskReward', 'confidence',
      'status', 'isPremium', 'image', 'tags', 'categoryId',
      'summary', 'summaryAr', 'trend',
      'support1', 'support2', 'support3',
      'resistance1', 'resistance2', 'resistance3',
      'technicalAnalysis', 'technicalAnalysisAr',
      'fundamentalAnalysis', 'fundamentalAnalysisAr',
      'rsi', 'macdValue', 'macdSignal', 'macdHistogram',
      'emaFast', 'emaSlow', 'smaPeriod', 'smaValue', 'atr',
      'bbUpper', 'bbMiddle', 'bbLower', 'adx', 'cci',
      'notes', 'notesAr', 'winRate', 'analysis', 'tradingRules',
    ]

    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field]
      }
    }

    if (
      (data.status === 'PUBLISHED' || data.status === 'FEATURED') &&
      !existing.publishedAt
    ) {
      updateData.publishedAt = new Date()
    }

    const strategy = await prisma.strategy.update({
      where: { id },
      data: updateData as any,
    })

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_STRATEGY',
        targetId: strategy.id,
        targetType: 'strategy',
        details: `Updated strategy: ${strategy.title}`,
      },
    })

    return NextResponse.json({ success: true, strategy })
  } catch (error) {
    console.error('Admin strategy update error:', error)
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
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const { id } = await params

    const existing = await prisma.strategy.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found.' },
        { status: 404 }
      )
    }

    await prisma.strategy.delete({ where: { id } })

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'DELETE_STRATEGY',
        targetId: id,
        targetType: 'strategy',
        details: `Deleted strategy: ${existing.title}`,
      },
    })

    return NextResponse.json({ success: true, message: 'Strategy deleted.' })
  } catch (error) {
    console.error('Admin strategy delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
