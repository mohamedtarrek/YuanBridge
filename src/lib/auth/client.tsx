'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface ClientUser {
  id: string
  name: string | null
  email: string | null
  role: string
  image: string | null
  language: string
  theme: string
}

interface Session {
  user: ClientUser | null
}

interface AuthContextValue {
  session: Session
  status: 'loading' | 'authenticated' | 'unauthenticated'
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ user: null })
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) {
        setSession({ user: data.user })
        setStatus('authenticated')
      } else {
        setSession({ user: null })
        setStatus('unauthenticated')
      }
    } catch {
      setSession({ user: null })
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.message || 'Authentication failed' }
      }
      if (data.user) {
        setSession({ user: data.user })
        setStatus('authenticated')
      }
      return { success: true }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // proceed anyway
    }
    setSession({ user: null })
    setStatus('unauthenticated')
    router.refresh()
  }, [router])

  return (
    <AuthContext.Provider value={{ session, status, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useSession must be used within an AuthProvider')
  }
  return ctx
}
