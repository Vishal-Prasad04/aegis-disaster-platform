import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import Toast from '../components/common/Toast'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-base-900">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}
