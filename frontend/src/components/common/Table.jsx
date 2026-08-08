import { ArrowUpDown } from 'lucide-react'
import { classNames } from '../../utils/helpers'
import EmptyState from './EmptyState'
import Loader from './Loader'

/**
 * columns: [{ key, header, sortable?, render?: (row) => node, className? }]
 */
export default function Table({ columns, rows, loading, emptyMessage = 'No records found', sortKey, sortDir, onSort, rowKey = 'id' }) {
  if (loading) return <Loader label="Loading records..." />
  if (!rows || rows.length === 0) return <EmptyState message={emptyMessage} />

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-left">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3 text-xs font-medium text-ink-500 uppercase tracking-wide whitespace-nowrap">
                {col.sortable ? (
                  <button
                    onClick={() => onSort?.(col.key)}
                    className="inline-flex items-center gap-1 hover:text-ink-300"
                  >
                    {col.header}
                    <ArrowUpDown size={12} className={sortKey === col.key ? 'text-signal-info' : 'text-ink-700'} />
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={classNames('px-5 py-3.5 whitespace-nowrap text-ink-300', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
