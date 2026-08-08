import axios from 'axios'

// Every request from every *Api.js file goes through this single instance.
// Base URL is fully environment-driven — set VITE_API_URL in .env for local
// dev, or in your hosting provider's environment settings for production.
// Never hardcode a production URL here.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const TOKEN_KEY = 'aegis_token'
const REFRESH_KEY = 'aegis_refresh_token'

// Requests to these paths must never trigger the refresh/redirect flow below —
// a 401 from /auth/login just means "wrong password" and should surface as a
// normal form error, not a session-expiry redirect.
const AUTH_BOUNDARY_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

function isAuthBoundaryRequest(config) {
  return AUTH_BOUNDARY_PATHS.some((p) => config?.url?.includes(p))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?sessionExpired=1'
  }
}

// Attach the auth token to every request.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralised response/error handling:
//  - Normalises backend errors into a plain `message` string (never a raw
//    stack trace — the backend itself only ever sends user-safe messages).
//  - On a 401 from a protected endpoint, tries exactly one silent token
//    refresh using the stored refresh token, retries the original request,
//    and only forces a logout + redirect to /login if that also fails.
let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) return null

  // De-dupe concurrent 401s (e.g. several widgets fetching at once) into a
  // single in-flight refresh call instead of firing one per failed request.
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken })
      .then((res) => res.data?.data)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config
    const status = error?.response?.status

    if (status === 401 && originalConfig && !originalConfig._retry && !isAuthBoundaryRequest(originalConfig)) {
      originalConfig._retry = true
      try {
        const refreshed = await refreshAccessToken()
        if (refreshed?.token) {
          localStorage.setItem(TOKEN_KEY, refreshed.token)
          if (refreshed.refreshToken) localStorage.setItem(REFRESH_KEY, refreshed.refreshToken)
          originalConfig.headers = originalConfig.headers || {}
          originalConfig.headers.Authorization = `Bearer ${refreshed.token}`
          return axiosClient(originalConfig)
        }
      } catch {
        // fall through to session-expiry handling below
      }
      clearSession()
      redirectToLogin()
    }

    const message = error?.response?.data?.message || error.message || 'Unexpected network error'
    return Promise.reject({ ...error, message })
  },
)

export default axiosClient
