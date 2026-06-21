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

        console.log('[AUTH::authorize] Looking up user:', email)
        let user
        try {
          user = await prisma.user.findUnique({
            where: { email },
          })
        } catch (err) {
          console.error('[AUTH::authorize] DB lookup failed:', err)
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

        console.log('[AUTH::authorize] Comparing password for:', email)
        let isValid: boolean
        try {
          isValid = await bcrypt.compare(password, user.password)
        } catch (err) {
          console.error('[AUTH::authorize] bcrypt.compare failed:', err)
          return null
        }

        if (!isValid) {
          console.warn('[AUTH::authorize] Invalid password for:', email)
          return null
        }

        console.log('[AUTH::authorize] Authentication successful for:', email, 'role:', user.role)
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
}

export const { handlers, auth: nextAuthAuth, signIn, signOut } = NextAuth(authOptions)
