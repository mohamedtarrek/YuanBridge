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

export async function requirePremium(): Promise<SessionPayload> {
  const session = await requireAuth()
  if (session.role === 'PREMIUM_USER' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
    return session
  }
  redirect('/pricing')
}

export async function requireModerator(): Promise<SessionPayload> {
  const session = await requireAuth()
  if (session.role !== 'MODERATOR' && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
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

async function getRolesAbove(role: string): Promise<string[]> {
  const hierarchy: Record<string, string[]> = {
    'USER': ['USER'],
    'PREMIUM_USER': ['USER', 'PREMIUM_USER'],
    'MODERATOR': ['USER', 'PREMIUM_USER', 'MODERATOR'],
    'ADMIN': ['USER', 'PREMIUM_USER', 'MODERATOR', 'ADMIN'],
    'SUPER_ADMIN': ['USER', 'PREMIUM_USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
  }
  return hierarchy[role] || ['USER']
}

export async function canAccess(requiredRole: string): Promise<boolean> {
  const session = await auth()
  if (!session) return false
  const allowed = await getRolesAbove(session.role)
  return allowed.includes(requiredRole)
}

export type { SessionPayload }
export { getSessionFromCookieString }
