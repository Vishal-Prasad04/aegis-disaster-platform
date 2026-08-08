import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ADMIN_ONLY_ROLES } from '../constants'

export default function AdminRoute({ children }) {
  const { hasRole } = useAuth()

  if (!hasRole(...ADMIN_ONLY_ROLES)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
