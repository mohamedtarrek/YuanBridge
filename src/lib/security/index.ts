import { z } from 'zod'
import { rateLimitByIp } from './rate-limit'
import type { User } from '@/generated/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export { rateLimitByIp } from './rate-limit'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const strategySchema = z.object({
  title: z.string().min(1).max(200),
  titleAr: z.string().min(1).max(200),
  currencyPair: z.string().min(1).max(20),
  direction: z.enum(['BUY', 'SELL']),
  entryPrice: z.number().positive(),
  stopLoss: z.number().positive(),
  takeProfit1: z.number().positive(),
  takeProfit2: z.number().positive(),
  risk: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  confidence: z.number().min(0).max(100),
  summary: z.string().min(1).max(2000),
  summaryAr: z.string().min(1).max(2000),
  isPremium: z.boolean().default(false),
  trend: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
})

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
})

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(input)

  if (!result.success) {
    const errors: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!errors[path]) errors[path] = []
      errors[path].push(issue.message)
    }
    return { success: false, errors }
  }

  return { success: true, data: result.data }
}

export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password: _, ...safeUser } = user
  return safeUser
}

export async function rateLimit(
  limit: number = 10,
  windowMs: number = 60_000
): Promise<{ success: boolean; remaining: number } | NextResponse> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? headersList.get('x-real-ip')
    ?? 'unknown'

  const result = rateLimitByIp(ip, limit, windowMs)

  if (!result.success) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  return { success: true, remaining: result.remaining }
}

export async function csrfProtection(): Promise<void | NextResponse> {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const host = headersList.get('host')

  if (!origin && !host) {
    return NextResponse.json(
      { message: 'CSRF validation failed' },
      { status: 403 }
    )
  }

  if (origin && host) {
    try {
      const originUrl = new URL(origin)
      if (originUrl.host !== host && !originUrl.host.endsWith(`.${host}`)) {
        return NextResponse.json(
          { message: 'CSRF validation failed' },
          { status: 403 }
        )
      }
    } catch {
      return NextResponse.json(
        { message: 'CSRF validation failed' },
        { status: 403 }
      )
    }
  }
}
