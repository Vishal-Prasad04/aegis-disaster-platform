import { classNames } from '../../utils/helpers'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-signal-info text-base-950 hover:bg-signal-info/90 focus-visible:ring-signal-info',
  danger: 'bg-signal-critical text-white hover:bg-signal-critical/90 focus-visible:ring-signal-critical',
  ghost: 'bg-transparent text-ink-300 hover:bg-white/5 hover:text-ink-100',
  outline: 'bg-transparent border border-white/15 text-ink-100 hover:bg-white/5',
}

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classNames(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-base-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  )
}
