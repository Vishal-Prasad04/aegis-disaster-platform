import axiosClient from './axiosClient'
import { mockResolve, mockReject } from './mockAdapter'
import users from '../mock/users.json'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' // live Spring Boot backend by default

/**
 * POST /auth/login
 * body: { email: string, password: string }
 * success: { data: { user: User, token: string }, message: string }
 * error:   { message: string } (401 invalid credentials)
 */
export async function login({ email, password }) {
  if (USE_MOCKS) {
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) return mockReject('Invalid email or password', 401)
    const { password: _pw, ...safeUser } = user
    return mockResolve({ user: safeUser, token: `mock-jwt-${user.id}` }, 'Login successful')
  }
  const res = await axiosClient.post('/auth/login', { email, password })
  return res.data
}

/**
 * POST /auth/logout
 * success: { message: string }
 */
export async function logout() {
  if (USE_MOCKS) return mockResolve(null, 'Logged out')
  const res = await axiosClient.post('/auth/logout')
  return res.data
}

/**
 * GET /auth/me
 * Returns the currently authenticated user based on the bearer token.
 * success: { data: { user: User } }
 */
export async function getCurrentUser(token) {
  if (USE_MOCKS) {
    const id = token?.replace('mock-jwt-', '')
    const user = users.find((u) => u.id === id)
    if (!user) return mockReject('Session expired', 401)
    const { password: _pw, ...safeUser } = user
    return mockResolve({ user: safeUser })
  }
  const res = await axiosClient.get('/auth/me')
  return res.data
}

/**
 * PATCH /auth/users/:id/role
 * body: { role: 'Admin' | 'Coordinator' | 'Field Officer' | 'Volunteer' }
 * success: { data: { user: User } }
 */
export async function updateUserRole(userId, role) {
  if (USE_MOCKS) return mockResolve({ user: { id: userId, role } }, 'Role updated')
  const res = await axiosClient.patch(`/auth/users/${userId}/role`, { role })
  return res.data
}
