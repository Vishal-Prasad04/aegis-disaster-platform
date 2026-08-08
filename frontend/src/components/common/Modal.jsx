import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-base-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} panel p-0 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-white/[0.06] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
