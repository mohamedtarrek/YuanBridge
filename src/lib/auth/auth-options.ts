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

console.log('[AUTH::INIT] Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  hasAuthSecret: !!process.env.AUTH_SECRET,
  authSecretLength: process.env.AUTH_SECRET?.length,
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30),
  hasDirectUrl: !!process.env.DIRECT_URL,
  hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
  hasAuthUrl: !!process.env.AUTH_URL,
  hasAuthTrustHost: !!process.env.AUTH_TRUST_HOST,
  googleIdConfigured: !!process.env.AUTH_GOOGLE_ID,
  githubIdConfigured: !!process.env.AUTH_GITHUB_ID,
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
        console.log('[AUTH::authorize] Credentials received:', { email: credentials?.email, hasPassword: !!credentials?.password })

        if (!credentials?.email || !credentials?.password) {
          console.warn('[AUTH::authorize] Missing email or password')
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        console.log('[AUTH::authorize] Looking up user in DB:', email)
        console.log('[AUTH::authorize] DB URL:', process.env.DATABASE_URL?.substring(0, 30) + '...')

        let user
        try {
          user = await prisma.user.findUnique({
            where: { email },
          })
          console.log('[AUTH::authorize] DB lookup result:', user ? `User found: ${user.id}` : 'User NOT found')
        } catch (err) {
          console.error('[AUTH::authorize] DB lookup EXCEPTION:', err)
          console.error('[AUTH::authorize] DB lookup error details:', err instanceof Error ? { message: err.message, stack: err.stack?.substring(0, 500) } : err)
          return null
        }

        if (!user) {
          console.warn('[AUTH::authorize] User not found:', email)
          return null
        }

        if (!user.password) {
          console.warn('[AUTH::authorize] User has no password set (OAuth only?):', email)
          return null
        }

        if (user.isBanned) {
          console.warn('[AUTH::authorize] Banned user attempted login:', email)
          return null
        }

        console.log('[AUTH::authorize] Password hash present, comparing...')
        console.log('[AUTH::authorize] Password hash length:', user.password.length)
        let isValid: boolean
        try {
          isValid = await bcrypt.compare(password, user.password)
          console.log('[AUTH::authorize] bcrypt.compare result:', isValid)
        } catch (err) {
          console.error('[AUTH::authorize] bcrypt.compare EXCEPTION:', err)
          return null
        }

        if (!isValid) {
          console.warn('[AUTH::authorize] Invalid password for:', email)
          return null
        }

        console.log('[AUTH::authorize] *** AUTH SUCCESS *** for:', email, 'role:', user.role)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? '',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    }),
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
      console.log('[AUTH::jwt] Callback invoked:', {
        hasToken: !!token,
        hasUser: !!user,
        hasAccount: !!account,
        provider: account?.provider,
        userId: user?.id,
        tokenRole: token.role,
      })
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: UserRole }).role
        console.log('[AUTH::jwt] Added user data to token:', { id: token.id, role: token.role })
      }
      console.log('[AUTH::jwt] Returning token')
      return token
    },
    async session({ session, token }) {
      console.log('[AUTH::session] Callback invoked:', {
        hasSession: !!session,
        hasToken: !!token,
        tokenId: token.id,
        tokenRole: token.role,
        sessionUser: session.user?.email,
      })
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        console.log('[AUTH::session] Set session user:', { id: session.user.id, role: session.user.role })
      }
      return session
    },
    async signIn({ user, account }) {
      console.log('[AUTH::signIn] Callback invoked:', {
        userId: user?.id,
        email: user?.email,
        provider: account?.provider,
        hasAccount: !!account,
      })
      return true
    },
  },
  trustHost: true,
}

console.log('[AUTH::INIT] Auth options configured')

export const { handlers, auth: nextAuthAuth, signIn, signOut } = NextAuth(authOptions)
