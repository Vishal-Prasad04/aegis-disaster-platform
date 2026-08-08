import { classNames } from '../../utils/helpers'
import { STATUS_COLOR_MAP } from '../../constants'

const SIGNAL_CLASSES = {
  critical: 'bg-signal-critical/15 text-signal-critical border-signal-critical/30',
  warning: 'bg-signal-warning/15 text-signal-warning border-signal-warning/30',
  safe: 'bg-signal-safe/15 text-signal-safe border-signal-safe/30',
  info: 'bg-signal-info/15 text-signal-info border-signal-info/30',
}

export default function StatusBadge({ status, className = '' }) {
  const signal = STATUS_COLOR_MAP[status] || 'info'
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border font-mono',
        SIGNAL_CLASSES[signal],
        className,
      )}
    >
      <span className={classNames('h-1.5 w-1.5 rounded-full', {
        critical: 'bg-signal-critical',
        warning: 'bg-signal-warning',
        safe: 'bg-signal-safe',
        info: 'bg-signal-info',
      }[signal])} />
      {status}
    </span>
  )
}
