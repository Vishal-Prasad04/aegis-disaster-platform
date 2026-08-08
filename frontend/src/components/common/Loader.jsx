import { Loader2 } from 'lucide-react'

export default function Loader({ label = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-ink-500 ${className}`}>
      <Loader2 size={22} className="animate-spin text-signal-info" />
      <p className="text-xs font-mono">{label}</p>
    </div>
  )
}
