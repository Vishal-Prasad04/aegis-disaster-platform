import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authApi from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('aegis_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .getCurrentUser(token)
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        // Token invalid/expired and axiosClient's own refresh attempt (see
        // api/axiosClient.js) already failed by the time this rejects, so
        // clear whatever's left rather than leaving a stale session.
        localStorage.removeItem('aegis_token')
        localStorage.removeItem('aegis_refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const { data } = await authApi.login({ email, password })
      localStorage.setItem('aegis_token', data.token)
      if (data.refreshToken) localStorage.setItem('aegis_refresh_token', data.refreshToken)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    }
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    localStorage.removeItem('aegis_token')
    localStorage.removeItem('aegis_refresh_token')
    setUser(null)
  }, [])

  const hasRole = useCallback((...roles) => !!user && roles.includes(user.role), [user])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, hasRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
