import { NextResponse } from 'next/server'

const COOKIE_NAME = 'session'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
