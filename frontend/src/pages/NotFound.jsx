import { Link } from 'react-router-dom'
import { RadioTower } from 'lucide-react'
import Button from '../components/common/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-900 bg-grid-overlay flex flex-col items-center justify-center text-center px-4">
      <div className="h-14 w-14 rounded-xl bg-signal-warning/10 flex items-center justify-center mb-4">
        <RadioTower size={24} className="text-signal-warning" />
      </div>
      <p className="font-mono text-xs text-ink-500 mb-2">ERROR 404 · SIGNAL LOST</p>
      <h1 className="font-display text-2xl font-semibold text-ink-100">This route isn't on the map</h1>
      <p className="text-sm text-ink-500 mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  )
}
