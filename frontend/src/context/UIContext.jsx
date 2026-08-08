import { createContext, useContext, useState, useCallback } from 'react'
import { generateId } from '../utils/helpers'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [toasts, setToasts] = useState([])

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    (message, variant = 'info') => {
      const id = generateId('toast')
      setToasts((prev) => [...prev, { id, message, variant }])
      setTimeout(() => dismissToast(id), 4000)
    },
    [dismissToast],
  )

  const notifySuccess = useCallback((message) => pushToast(message, 'success'), [pushToast])
  const notifyError = useCallback((message) => pushToast(message, 'error'), [pushToast])
  const notifyInfo = useCallback((message) => pushToast(message, 'info'), [pushToast])

  return (
    <UIContext.Provider
      value={{ sidebarOpen, toggleSidebar, toasts, pushToast, dismissToast, notifySuccess, notifyError, notifyInfo }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
