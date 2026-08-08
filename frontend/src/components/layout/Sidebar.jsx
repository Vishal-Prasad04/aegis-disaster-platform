import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  Boxes,
  Home,
  ArrowLeftRight,
  Users,
  BellRing,
  BarChart3,
  Shield,
  X,
} from 'lucide-react'
import { useUI } from '../../context/UIContext'
import { classNames } from '../../utils/helpers'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/disaster-map', label: 'Disaster Map', icon: Map },
  { to: '/resources', label: 'Resources', icon: Boxes },
  { to: '/shelters', label: 'Shelters', icon: Home },
  { to: '/allocation', label: 'Allocation', icon: ArrowLeftRight },
  { to: '/rescue-teams', label: 'Rescue Teams', icon: Users },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUI()

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={toggleSidebar} />
      )}
      <aside
        className={classNames(
          'fixed lg:sticky top-0 h-screen z-40 w-64 shrink-0 bg-base-950 border-r border-white/[0.06] flex flex-col transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-signal-info/15 flex items-center justify-center">
              <Shield size={16} className="text-signal-info" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm leading-none">Aegis</p>
              <p className="text-[10px] text-ink-500 font-mono mt-0.5">DISASTER OPS</p>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-ink-500">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-signal-info/10 text-signal-info font-medium'
                    : 'text-ink-500 hover:text-ink-100 hover:bg-white/[0.03]',
                )
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-mono text-ink-700">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-safe animate-pulse" />
            SYSTEM OPERATIONAL
          </div>
        </div>
      </aside>
    </>
  )
}
