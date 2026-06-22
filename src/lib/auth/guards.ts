import { redirect } from 'next/navigation'
import { getSessionFromCookieString, type SessionPayload } from './session'

async function getSessionFromHeaders(): Promise<SessionPayload | null> {
  const { headers } = await import('next/headers')
  const headersList = await headers()
  const cookieString = headersList.get('cookie')
  return getSessionFromCookieString(cookieString)
}

export async function auth(): Promise<SessionPayload | null> {
  return getSessionFromHeaders()
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth()
  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }
  return session
}

export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await requireAuth()
  if (session.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }
  return session
}

export type { SessionPayload }
export { getSessionFromCookieString }
