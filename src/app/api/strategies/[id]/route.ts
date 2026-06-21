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

    let isPremiumUser = false
    if (session?.user?.id) {
      const sub = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
        select: { plan: true, status: true },
      })
      isPremiumUser = sub?.plan === 'PREMIUM' && sub?.status === 'ACTIVE'
    }

    const strategy = await prisma.strategy.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, nameAr: true } },
      },
    })

    if (!strategy) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found.' },
        { status: 404 }
      )
    }

    if (strategy.status !== 'PUBLISHED' && strategy.status !== 'FEATURED') {
      return NextResponse.json(
        { success: false, message: 'Strategy not found.' },
        { status: 404 }
      )
    }

    if (strategy.isPremium && !isPremiumUser) {
      return NextResponse.json(
        { success: false, message: 'This strategy is available only for Premium members.', requiresPremium: true },
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
