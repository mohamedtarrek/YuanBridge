import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/db'
import { sanitizeUser } from '@/lib/security'

const COOKIE_NAME = 'session'

function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (secret) return new TextEncoder().encode(secret)
  const key = new Uint8Array(32)
  crypto.getRandomValues(key)
  return key
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`))
    if (!match) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const token = decodeURIComponent(match[1])
    let payload: { sub: string; role: string }
    try {
      const result = await jwtVerify(token, getKey(), { algorithms: ['HS256'] })
      payload = { sub: result.payload.sub as string, role: result.payload.role as string }
    } catch {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        language: true,
        theme: true,
        isBanned: true,
      },
    })

    if (!user || user.isBanned) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[ME] Error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
