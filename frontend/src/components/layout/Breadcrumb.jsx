import { useLocation, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const LABELS = {
  dashboard: 'Dashboard',
  'disaster-map': 'Disaster Map',
  resources: 'Resources',
  shelters: 'Shelters',
  allocation: 'Allocation',
  'rescue-teams': 'Rescue Teams',
  alerts: 'Alerts',
  analytics: 'Analytics',
  profile: 'Profile',
  settings: 'Settings',
}

export default function Breadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link to="/dashboard" className="text-ink-500 hover:text-ink-100">
        Aegis
      </Link>
      {segments.map((seg, idx) => (
        <span key={seg + idx} className="flex items-center gap-1.5">
          <ChevronRight size={13} className="text-ink-700" />
          <span className={idx === segments.length - 1 ? 'text-ink-100 font-medium' : 'text-ink-500'}>
            {LABELS[seg] || seg}
          </span>
        </span>
      ))}
    </nav>
  )
}
