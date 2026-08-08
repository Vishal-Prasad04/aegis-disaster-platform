import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'Nothing here yet', hint, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center">
        <Icon size={20} className="text-ink-700" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-300">{message}</p>
        {hint && <p className="text-xs text-ink-500 mt-1">{hint}</p>}
      </div>
      {action}
    </div>
  )
}
