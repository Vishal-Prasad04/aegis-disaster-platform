import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut, User, Settings as SettingsIcon, ChevronDown } from 'lucide-react'
import { useUI } from '../../context/UIContext'
import { useAuth } from '../../context/AuthContext'
import Breadcrumb from './Breadcrumb'

export default function Navbar() {
  const { toggleSidebar } = useUI()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/[0.06] bg-base-900/90 backdrop-blur">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="lg:hidden text-ink-300">
          <Menu size={20} />
        </button>
        <Breadcrumb />
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-lg hover:bg-white/[0.04]"
        >
          <div className="h-8 w-8 rounded-full bg-signal-info/15 text-signal-info flex items-center justify-center text-xs font-semibold font-mono">
            {user?.avatar || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-ink-100 leading-none">{user?.name}</p>
            <p className="text-[10px] text-ink-500 mt-0.5">{user?.role}</p>
          </div>
          <ChevronDown size={14} className="text-ink-500" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-12 z-20 w-48 panel p-1.5">
              <button
                onClick={() => {
                  navigate('/profile')
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-ink-300 hover:bg-white/[0.05] hover:text-ink-100"
              >
                <User size={15} /> Profile
              </button>
              <button
                onClick={() => {
                  navigate('/settings')
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-ink-300 hover:bg-white/[0.05] hover:text-ink-100"
              >
                <SettingsIcon size={15} /> Settings
              </button>
              <div className="h-px bg-white/[0.06] my-1.5" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-signal-critical hover:bg-signal-critical/10"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
