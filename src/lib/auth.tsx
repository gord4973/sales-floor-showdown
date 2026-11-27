import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'
import type { Rep } from './types'

type AuthValue = {
  rep: Rep | null
  ready: boolean
  setRep: (rep: Rep | null) => void
  signIn: (payload: { name: string; team: string; pin: string }) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [rep, setRep] = useState<Rep | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('sf-token')
    if (!token) {
      setReady(true)
      return
    }
    api<{ rep: Rep }>('/api/me')
      .then((data) => setRep(data.rep))
      .catch(() => localStorage.removeItem('sf-token'))
      .finally(() => setReady(true))
  }, [])

  async function signIn(payload: { name: string; team: string; pin: string }) {
    const data = await api<{ token: string; rep: Rep }>('/api/auth', payload)
    localStorage.setItem('sf-token', data.token)
    setRep(data.rep)
  }

  function signOut() {
    localStorage.removeItem('sf-token')
    setRep(null)
  }

  return <AuthContext.Provider value={{ rep, ready, setRep, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('Auth missing')
  return value
}
