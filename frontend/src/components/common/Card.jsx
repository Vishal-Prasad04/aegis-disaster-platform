import { classNames } from '../../utils/helpers'

export default function Card({ children, className = '', padded = true, ...rest }) {
  return (
    <div className={classNames('panel', padded && 'p-5', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-display text-base font-semibold text-ink-100">{title}</h3>
        {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
