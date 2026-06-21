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

    if (strategy.isPremium && (!session?.user?.id)) {
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
