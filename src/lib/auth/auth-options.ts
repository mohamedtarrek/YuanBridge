import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import { prisma } from '@/lib/db'
import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    role?: UserRole
  }
  interface Session {
    user: {
      id: string
      role: UserRole
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}

console.log('[AUTH::INIT] Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  hasAuthSecret: !!process.env.AUTH_SECRET,
  hasAuthUrl: !!process.env.AUTH_URL || !!process.env.NEXTAUTH_URL,
  providers: [
    'credentials',
    process.env.AUTH_GOOGLE_ID && 'google',
    process.env.AUTH_GITHUB_ID && 'github',
  ].filter(Boolean).join(', '),
})

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as NextAuthConfig['adapter'],
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const authStep = (step: string, data?: unknown) =>
          console.log(`[AUTH::authorize:${step}]`, data ?? '')

        authStep('start', { email: credentials?.email, hasPassword: !!credentials?.password })

        try {
          if (!credentials?.email || !credentials?.password) {
            console.warn('[AUTH::authorize] REJECT: missing email or password')
            return null
          }

          const email = credentials.email as string
          const password = credentials.password as string

          authStep('db-lookup', email)

          let user
          try {
            user = await prisma.user.findUnique({
              where: { email },
            })
          } catch (err) {
            console.error('[AUTH::authorize] DB EXCEPTION:', err instanceof Error ? err.message : err)
            console.error('[AUTH::authorize] DB STACK:', err instanceof Error ? err.stack : 'no stack')
            return null
          }

          if (!user) {
            console.warn('[AUTH::authorize] REJECT: user not found', email)
            return null
          }

          authStep('user-found', { id: user.id, email: user.email, role: user.role, isBanned: user.isBanned, hasPassword: !!user.password })

          if (!user.password) {
            console.warn('[AUTH::authorize] REJECT: no password hash', email)
            return null
          }

          if (user.isBanned) {
            console.warn('[AUTH::authorize] REJECT: banned user', email)
            return null
          }

          authStep('bcrypt-compare', { hashLength: user.password.length })

          let isValid: boolean
          try {
            isValid = await bcrypt.compare(password, user.password)
          } catch (err) {
            console.error('[AUTH::authorize] BCRYPT EXCEPTION:', err instanceof Error ? err.message : err)
            console.error('[AUTH::authorize] BCRYPT STACK:', err instanceof Error ? err.stack : 'no stack')
            return null
          }

          if (!isValid) {
            console.warn('[AUTH::authorize] REJECT: invalid password', email)
            return null
          }

          console.log('[AUTH::authorize] *** AUTH SUCCESS ***', { email, role: user.role, id: user.id })
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        } catch (err) {
          console.error('[AUTH::authorize] UNEXPECTED ERROR:', err instanceof Error ? err.message : err)
          console.error('[AUTH::authorize] UNEXPECTED STACK:', err instanceof Error ? err.stack : 'no stack')
          return null
        }
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID ? [Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    })] : []),
    ...(process.env.AUTH_GITHUB_ID ? [GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    })] : []),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        console.log('[AUTH::jwt] invoked', { hasToken: !!token, hasUser: !!user, hasAccount: !!account, provider: account?.provider })
        if (user) {
          token.id = String(user.id)
          token.role = (user as { role: UserRole }).role
          console.log('[AUTH::jwt] user data added to token', { id: token.id, role: token.role })
        }
        return token
      } catch (err) {
        console.error('[AUTH::jwt] ERROR:', err instanceof Error ? err.message : err)
        console.error('[AUTH::jwt] STACK:', err instanceof Error ? err.stack : 'no stack')
        throw err
      }
    },
    async session({ session, token }) {
      try {
        console.log('[AUTH::session] invoked', { hasSession: !!session, hasToken: !!token, tokenId: token.id, tokenRole: token.role })
        if (session.user) {
          session.user.id = String(token.id)
          session.user.role = token.role as UserRole
          console.log('[AUTH::session] session user set', { id: session.user.id, role: session.user.role })
        }
        return session
      } catch (err) {
        console.error('[AUTH::session] ERROR:', err instanceof Error ? err.message : err)
        console.error('[AUTH::session] STACK:', err instanceof Error ? err.stack : 'no stack')
        throw err
      }
    },
    async signIn({ user, account }) {
      try {
        console.log('[AUTH::signIn] invoked', { userId: user?.id, email: user?.email, provider: account?.provider })
        if (!user) {
          console.warn('[AUTH::signIn] REJECT: no user')
          return false
        }
        return true
      } catch (err) {
        console.error('[AUTH::signIn] ERROR:', err instanceof Error ? err.message : err)
        console.error('[AUTH::signIn] STACK:', err instanceof Error ? err.stack : 'no stack')
        return false
      }
    },
  },
  trustHost: true,
}

console.log('[AUTH::INIT] Auth options configured')

export const { handlers, auth: nextAuthAuth, signIn, signOut } = NextAuth(authOptions)
