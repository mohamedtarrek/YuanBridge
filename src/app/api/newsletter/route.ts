import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/security'
import { z } from 'zod'

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: Request) {
  try {
    const rateCheck = await rateLimit(5, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const body = await request.json()
    const validation = newsletterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format.' },
        { status: 400 }
      )
    }

    const { email } = validation.data

    const existing = await prisma.appSetting.findUnique({
      where: { key: `newsletter:${email}` },
    })
    if (!existing) {
      await prisma.appSetting.create({
        data: {
          key: `newsletter:${email}`,
          value: JSON.stringify({ email, subscribedAt: new Date().toISOString() }),
        },
      }).catch(() => { })
    }

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to the newsletter.', email },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
