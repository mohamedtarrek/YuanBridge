import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { loginSchema } from '@/lib/auth'
import { rateLimit, sanitizeUser } from '@/lib/security'
import { SignJWT } from 'jose'

const COOKIE_NAME = 'session'
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (secret) return new TextEncoder().encode(secret)
  const key = new Uint8Array(32)
  crypto.getRandomValues(key)
  return key
}

export async function POST(request: Request) {
  try {
    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.')
        if (!errors[path]) errors[path] = []
        errors[path].push(issue.message)
      }
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const token = await new SignJWT({ sub: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
      .sign(getKey())

    const isSecure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

    const response = NextResponse.json({
      success: true,
      user: sanitizeUser(user),
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    return response
  } catch (error) {
    console.error('[LOGIN] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
