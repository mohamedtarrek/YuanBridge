import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { rateLimit, validateInput, registerSchema, sanitizeUser } from '@/lib/security'

export async function POST(request: Request) {
  try {
    console.log('[REGISTER] Request received')

    const rateCheck = await rateLimit(5, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const body = await request.json()
    const validation = validateInput(registerSchema, body)
    if (!validation.success) {
      console.log('[REGISTER] Validation failed:', validation.errors)
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data
    console.log('[REGISTER] Validation passed for:', email)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      console.log('[REGISTER] Email already exists:', email)
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    console.log('[REGISTER] Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('[REGISTER] Password hashed successfully')

    console.log('[REGISTER] Creating user in database...')
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        language: 'ar',
        theme: 'dark',
        subscription: {
          create: {
            plan: 'FREE',
            status: 'TRIALING',
          },
        },
      },
    })
    console.log('[REGISTER] User created successfully:', user.id)

    const safeUser = sanitizeUser(user)

    return NextResponse.json(
      { success: true, message: 'User registered successfully.', user: safeUser },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER] ERROR:', error)
    const message = error instanceof Error ? error.message : 'Internal server error.'
    return NextResponse.json(
      { success: false, message, error: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    )
  }
}
