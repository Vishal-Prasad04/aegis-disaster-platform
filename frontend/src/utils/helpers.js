export function formatDate(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(isoString) {
  if (!isoString) return '—'
  const diffMs = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ')
}

export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function percentage(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

export function sortByKey(items, key, direction = 'asc') {
  const sorted = [...items].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
    return 0
  })
  return sorted
}
