import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const results: Record<string, unknown> = {
      envCheck: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30),
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasAuthUrl: !!process.env.AUTH_URL,
        nodeEnv: process.env.NODE_ENV,
      },
      input: { email: email?.substring(0, 5) + '...', hasPassword: !!password },
    }

    let user
    try {
      user = await prisma.user.findUnique({ where: { email } })
      results.userLookup = user ? `Found: ${user.id} (${user.role})` : 'NOT FOUND'
    } catch (err) {
      results.userLookup = `DB ERROR: ${err instanceof Error ? err.message : String(err)}`
    }

    if (user && user.password) {
      try {
        const isValid = await bcrypt.compare(password, user.password)
        results.passwordCheck = `bcrypt.compare: ${isValid}`
      } catch (err) {
        results.passwordCheck = `bcrypt ERROR: ${err instanceof Error ? err.message : String(err)}`
      }
      results.userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
        hasPassword: !!user.password,
        passwordHashLength: user.password.length,
      }
    }

    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 })
  }
}
