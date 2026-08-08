import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900">
        <Loader label="Checking session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
