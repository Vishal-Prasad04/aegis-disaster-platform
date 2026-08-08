import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-base-800 border border-white/[0.08] rounded-lg pl-9 pr-8 py-2 text-sm text-ink-100 placeholder:text-ink-700 focus:outline-none focus:border-signal-info/50 focus:ring-1 focus:ring-signal-info/30"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-100">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
