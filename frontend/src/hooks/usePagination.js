import { useMemo, useState } from 'react'
import { paginate } from '../utils/helpers'
import { PAGE_SIZE } from '../constants'

export function usePagination(items, pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const pageItems = useMemo(() => paginate(items, page, pageSize), [items, page, pageSize])

  const goTo = (nextPage) => setPage(Math.min(Math.max(1, nextPage), totalPages))
  const next = () => goTo(page + 1)
  const prev = () => goTo(page - 1)

  return { page, totalPages, pageItems, goTo, next, prev, setPage }
}
