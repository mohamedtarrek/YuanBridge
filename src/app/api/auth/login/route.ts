import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { rateLimit, validateInput, loginSchema, sanitizeUser } from '@/lib/security'

export async function POST(request: Request) {
  try {
    console.log('[LOGIN::POST] Request received')

    const rateCheck = await rateLimit(10, 60_000)
    if (rateCheck instanceof NextResponse) {
      console.warn('[LOGIN::POST] Rate limit hit')
      return rateCheck
    }

    const body = await request.json()
    console.log('[LOGIN::POST] Parsed body:', { email: body.email, hasPassword: !!body.password })

    const validation = validateInput(loginSchema, body)
    if (!validation.success) {
      console.warn('[LOGIN::POST] Validation failed:', validation.errors)
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const { email, password } = validation.data
    console.log('[LOGIN::POST] Validation passed for:', email)

    console.log('[LOGIN::POST] Looking up user:', email)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) {
      console.warn('[LOGIN::POST] User not found or no password:', email)
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    console.log('[LOGIN::POST] User found, comparing password')
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      console.warn('[LOGIN::POST] Invalid password for:', email)
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    console.log('[LOGIN::POST] Password verified for:', email, 'role:', user.role)
    const safeUser = sanitizeUser(user)

    console.log('[LOGIN::POST] Returning success response')
    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: safeUser,
    })
  } catch (error) {
    console.error('[LOGIN::POST] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
