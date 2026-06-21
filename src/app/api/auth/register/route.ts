import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { rateLimit, validateInput, registerSchema, sanitizeUser } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const rateCheck = await rateLimit(5, 60_000)
    if (rateCheck instanceof NextResponse) return rateCheck

    const body = await request.json()
    const validation = validateInput(registerSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

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

    const safeUser = sanitizeUser(user)

    return NextResponse.json(
      { success: true, message: 'User registered successfully.', user: safeUser },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
