import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { UserRole } from '@prisma/client'

const COOKIE_NAME = 'session'
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

let _randomKey: Uint8Array | null = null

function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (secret) return new TextEncoder().encode(secret)
  if (!_randomKey) {
    _randomKey = new Uint8Array(32)
    crypto.getRandomValues(_randomKey)
  }
  return _randomKey
}

function cookieOptions(maxAge: number) {
  const isSecure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export interface SessionPayload {
  sub: string
  role: UserRole
}

async function encode(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getKey())
}

async function decode(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] })
    return { sub: payload.sub as string, role: payload.role as UserRole }
  } catch {
    return null
  }
}

export async function createSessionResponse(userId: string, role: UserRole) {
  const token = await encode({ sub: userId, role })
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, token, cookieOptions(SESSION_MAX_AGE_SECONDS))
  return response
}

export async function createSessionAndRedirect(userId: string, role: UserRole, redirectUrl: string) {
  const token = await encode({ sub: userId, role })
  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set(COOKIE_NAME, token, cookieOptions(SESSION_MAX_AGE_SECONDS))
  return response
}

export function getSessionFromCookieString(cookieString: string | null): Promise<SessionPayload | null> {
  if (!cookieString) return Promise.resolve(null)
  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`))
  if (!match) return Promise.resolve(null)
  return decode(decodeURIComponent(match[1]))
}

export function destroySessionResponse() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, '', cookieOptions(0))
  return response
}

export function destroySessionAndRedirect(redirectUrl: string) {
  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set(COOKIE_NAME, '', cookieOptions(0))
  return response
}
