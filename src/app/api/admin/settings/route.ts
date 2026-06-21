import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      )
    }

    const appSettings = await prisma.appSetting.findMany()
    const settings: Record<string, string> = {}
    for (const s of appSettings) {
      settings[s.key] = s.value
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Settings error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    for (const [key, value] of Object.entries(body)) {
      await prisma.appSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    }

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_SETTINGS',
        details: `Updated settings: ${Object.keys(body).join(', ')}`,
      },
    })

    return NextResponse.json({ success: true, message: 'Settings updated.' })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
