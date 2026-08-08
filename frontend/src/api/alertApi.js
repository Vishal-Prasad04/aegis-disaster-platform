import axiosClient from './axiosClient'
import { mockResolve, mockReject, createMockStore } from './mockAdapter'
import seedAlerts from '../mock/alerts.json'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' // live Spring Boot backend by default
const store = createMockStore(seedAlerts, 'alt')

/**
 * GET /alerts?status=&priority=
 * success: { data: { items: Alert[], total: number } }
 */
export async function getAlerts(params = {}) {
  if (USE_MOCKS) {
    let items = store.list().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (params.status) items = items.filter((a) => a.status === params.status)
    if (params.priority) items = items.filter((a) => a.priority === params.priority)
    return mockResolve({ items, total: items.length })
  }
  const res = await axiosClient.get('/alerts', { params })
  return res.data
}

/**
 * POST /alerts
 * body: { title, priority, disasterId, description }
 * success: { data: { alert: Alert } }
 */
export async function createAlert(payload) {
  if (USE_MOCKS) {
    const alert = store.create({ ...payload, status: 'Open', createdAt: new Date().toISOString() })
    return mockResolve({ alert }, 'Alert raised')
  }
  const res = await axiosClient.post('/alerts', payload)
  return res.data
}

/**
 * PATCH /alerts/:id/status
 * body: { status: 'Open' | 'Acknowledged' | 'Resolved' }
 * success: { data: { alert: Alert } }
 */
export async function updateAlertStatus(id, status) {
  if (USE_MOCKS) {
    const alert = store.update(id, { status })
    if (!alert) return mockReject('Alert not found', 404)
    return mockResolve({ alert }, 'Alert status updated')
  }
  const res = await axiosClient.patch(`/alerts/${id}/status`, { status })
  return res.data
}

/**
 * DELETE /alerts/:id
 * success: { message: string }
 */
export async function deleteAlert(id) {
  if (USE_MOCKS) {
    const existed = store.remove(id)
    if (!existed) return mockReject('Alert not found', 404)
    return mockResolve(null, 'Alert removed')
  }
  const res = await axiosClient.delete(`/alerts/${id}`)
  return res.data
}
