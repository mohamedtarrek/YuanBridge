import { z } from 'zod'
import { rateLimitByIp } from './rate-limit'
import type { User } from '@prisma/client'
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
  titleAr: z.string().max(200).optional().nullable(),
  slug: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  descriptionAr: z.string().max(5000).optional().nullable(),
  currencyPair: z.string().min(1).max(20),
  direction: z.enum(['BUY', 'SELL']),
  entryPrice: z.number().positive(),
  stopLoss: z.number().positive(),
  takeProfit1: z.number().positive(),
  takeProfit2: z.number().positive().optional().nullable(),
  takeProfit3: z.number().positive().optional().nullable(),
  risk: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  riskPercent: z.number().min(0).max(100).optional().nullable(),
  riskReward: z.number().min(0).optional().nullable(),
  confidence: z.number().min(0).max(100),
  status: z.enum(['DRAFT', 'PUBLISHED', 'FEATURED']).default('DRAFT'),
  isPremium: z.boolean().default(false),
  image: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  summary: z.string().max(2000).optional().nullable(),
  summaryAr: z.string().max(2000).optional().nullable(),
  trend: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']).optional().nullable(),
  support1: z.number().optional().nullable(),
  support2: z.number().optional().nullable(),
  support3: z.number().optional().nullable(),
  resistance1: z.number().optional().nullable(),
  resistance2: z.number().optional().nullable(),
  resistance3: z.number().optional().nullable(),
  technicalAnalysis: z.string().optional().nullable(),
  technicalAnalysisAr: z.string().optional().nullable(),
  fundamentalAnalysis: z.string().optional().nullable(),
  fundamentalAnalysisAr: z.string().optional().nullable(),
  rsi: z.number().optional().nullable(),
  macdValue: z.number().optional().nullable(),
  macdSignal: z.number().optional().nullable(),
  macdHistogram: z.number().optional().nullable(),
  emaFast: z.number().optional().nullable(),
  emaSlow: z.number().optional().nullable(),
  smaPeriod: z.number().int().optional().nullable(),
  smaValue: z.number().optional().nullable(),
  atr: z.number().optional().nullable(),
  bbUpper: z.number().optional().nullable(),
  bbMiddle: z.number().optional().nullable(),
  bbLower: z.number().optional().nullable(),
  adx: z.number().optional().nullable(),
  cci: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  notesAr: z.string().optional().nullable(),
  winRate: z.number().min(0).max(100).optional().nullable(),
  analysis: z.string().optional().nullable(),
  tradingRules: z.string().optional().nullable(),
})

export const adminStrategySchema = strategySchema.extend({
  isPremium: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'FEATURED']).default('DRAFT'),
})

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  descriptionAr: z.string().max(1000).optional().nullable(),
  image: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
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
