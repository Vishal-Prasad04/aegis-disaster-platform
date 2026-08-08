import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

export default function Pagination({ page, totalPages, onPrev, onNext, onGoTo }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  )

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
      <p className="text-xs text-ink-500 font-mono">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={onPrev} disabled={page === 1} aria-label="Previous page" />
        {pages.map((p, idx) => (
          <div key={p} className="flex items-center">
            {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-ink-700 text-xs">…</span>}
            <button
              onClick={() => onGoTo(p)}
              className={`h-7 w-7 rounded-md text-xs font-mono transition-colors ${
                p === page ? 'bg-signal-info text-base-950 font-semibold' : 'text-ink-500 hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" icon={ChevronRight} onClick={onNext} disabled={page === totalPages} aria-label="Next page" />
      </div>
    </div>
  )
}
