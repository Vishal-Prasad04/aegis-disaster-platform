import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default function ErrorComponent({ message = 'Something went wrong while loading this data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-signal-critical/10 flex items-center justify-center">
        <AlertTriangle size={20} className="text-signal-critical" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-100">Couldn't load this data</p>
        <p className="text-xs text-ink-500 mt-1 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
