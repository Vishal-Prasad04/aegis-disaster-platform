import { Outlet } from 'react-router-dom'
import Toast from '../components/common/Toast'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-base-900 bg-grid-overlay flex items-center justify-center p-4">
      <Outlet />
      <Toast />
    </div>
  )
}
