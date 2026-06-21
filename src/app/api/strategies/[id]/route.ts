import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await rateLimit(30, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    const { id } = await params

    const strategy = await prisma.strategy.findUnique({ where: { id } })
    if (!strategy) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found.' },
        { status: 404 }
      )
    }

    if (strategy.isPremium && (!session?.user?.id || session.user.role !== 'PREMIUM')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Premium subscription required.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, strategy })
  } catch (error) {
    console.error('Strategy detail error:', error)
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

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.strategy.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found.' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'title', 'titleAr', 'currencyPair', 'direction', 'entryPrice',
      'stopLoss', 'takeProfit1', 'takeProfit2', 'risk', 'confidence',
      'summary', 'summaryAr', 'isPremium', 'isPublished', 'isApproved',
      'trend', 'technicalAnalysis', 'technicalAnalysisAr',
      'fundamentalAnalysis', 'fundamentalAnalysisAr',
      'support1', 'support2', 'support3',
      'resistance1', 'resistance2', 'resistance3',
      'rsi', 'macdValue', 'macdSignal', 'macdHistogram',
      'emaFast', 'emaSlow', 'smaPeriod', 'smaValue', 'atr',
      'bbUpper', 'bbMiddle', 'bbLower',
      'notes', 'notesAr', 'tradesAnalyzed', 'aiModel', 'aiProvider',
    ]

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (body.isApproved === true && !existing.publishedAt) {
      updateData.publishedAt = new Date()
    }

    const strategy = await prisma.strategy.update({
      where: { id },
      data: updateData as any,
    })

    return NextResponse.json({ success: true, strategy })
  } catch (error) {
    console.error('Strategy update error:', error)
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

    const { id } = await params
    const existing = await prisma.strategy.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found.' },
        { status: 404 }
      )
    }

    await prisma.strategy.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Strategy deleted.' })
  } catch (error) {
    console.error('Strategy delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
