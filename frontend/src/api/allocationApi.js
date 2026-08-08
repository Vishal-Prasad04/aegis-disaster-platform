import axiosClient from './axiosClient'
import { mockResolve, mockReject, createMockStore } from './mockAdapter'
import seedAllocations from '../mock/allocations.json'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' // live Spring Boot backend by default
const store = createMockStore(seedAllocations, 'alc')

/**
 * GET /allocations?status=&disasterId=
 * success: { data: { items: Allocation[], total: number } }
 */
export async function getAllocations(params = {}) {
  if (USE_MOCKS) {
    let items = store.list()
    const { status, disasterId } = params
    if (status) items = items.filter((a) => a.status === status)
    if (disasterId) items = items.filter((a) => a.disasterId === disasterId)
    return mockResolve({ items, total: items.length })
  }
  const res = await axiosClient.get('/allocations', { params })
  return res.data
}

/**
 * POST /allocations/assign
 * body: { resourceId, disasterId, quantity, requestedBy }
 * success: { data: { allocation: Allocation } }
 * error: 409 if requested quantity exceeds available stock
 */
export async function assignResource(payload) {
  if (USE_MOCKS) {
    const allocation = store.create({
      ...payload,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      completedAt: null,
    })
    return mockResolve({ allocation }, 'Allocation request created')
  }
  const res = await axiosClient.post('/allocations/assign', payload)
  return res.data
}

/**
 * PATCH /allocations/:id/status
 * body: { status: 'Pending'|'Approved'|'In Progress'|'Completed'|'Rejected' }
 * success: { data: { allocation: Allocation } }
 */
export async function updateAllocationStatus(id, status) {
  if (USE_MOCKS) {
    const completedAt = status === 'Completed' ? new Date().toISOString() : null
    const allocation = store.update(id, { status, ...(completedAt && { completedAt }) })
    if (!allocation) return mockReject('Allocation not found', 404)
    return mockResolve({ allocation }, 'Allocation status updated')
  }
  const res = await axiosClient.patch(`/allocations/${id}/status`, { status })
  return res.data
}

/**
 * GET /allocations/history?disasterId=
 * success: { data: { items: Allocation[] } } — completed + rejected only
 */
export async function getAllocationHistory(params = {}) {
  if (USE_MOCKS) {
    let items = store.list().filter((a) => ['Completed', 'Rejected'].includes(a.status))
    if (params.disasterId) items = items.filter((a) => a.disasterId === params.disasterId)
    return mockResolve({ items })
  }
  const res = await axiosClient.get('/allocations/history', { params })
  return res.data
}
