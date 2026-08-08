import { classNames } from '../../utils/helpers'

export default function Input({ label, error, className = '', textarea = false, ...rest }) {
  const Component = textarea ? 'textarea' : 'input'
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-ink-500 mb-1.5">{label}</label>}
      <Component
        className={classNames(
          'w-full bg-base-800 border rounded-lg px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-signal-critical/60 focus:border-signal-critical focus:ring-signal-critical/30'
            : 'border-white/[0.08] focus:border-signal-info/50 focus:ring-signal-info/30',
          textarea && 'min-h-[90px] resize-y',
        )}
        {...rest}
      />
      {error && <p className="text-xs text-signal-critical mt-1">{error}</p>}
    </div>
  )
}
