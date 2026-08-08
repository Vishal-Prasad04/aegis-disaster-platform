import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useUI } from '../../context/UIContext'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }
const COLORS = {
  success: 'border-signal-safe/30 text-signal-safe',
  error: 'border-signal-critical/30 text-signal-critical',
  info: 'border-signal-info/30 text-signal-info',
}

export default function Toast() {
  const { toasts, dismissToast } = useUI()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant] || Info
        return (
          <div
            key={toast.id}
            className={`panel flex items-start gap-2.5 px-4 py-3 border ${COLORS[toast.variant]} animate-[fadeIn_0.2s_ease-out]`}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <p className="text-sm text-ink-100 flex-1">{toast.message}</p>
            <button onClick={() => dismissToast(toast.id)} className="text-ink-500 hover:text-ink-100 shrink-0">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
