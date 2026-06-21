import { nextAuthAuth, handlers, signIn, signOut } from './auth-options'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'

export { handlers, signIn, signOut }

export async function auth() {
  return await nextAuthAuth()
}

export async function requireAuth() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return session
}

export async function requireAdmin() {
  const session = await requireAuth()

  if (session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth()

  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  return user
}
