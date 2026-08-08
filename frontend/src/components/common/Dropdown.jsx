import { ChevronDown } from 'lucide-react'

export default function Dropdown({ value, onChange, options, placeholder = 'All', className = '', label }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-ink-500 mb-1.5">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-base-800 border border-white/[0.08] rounded-lg pl-3 pr-8 py-2 text-sm text-ink-100 focus:outline-none focus:border-signal-info/50 focus:ring-1 focus:ring-signal-info/30"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
      </div>
    </div>
  )
}
