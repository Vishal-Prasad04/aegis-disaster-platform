import axiosClient from './axiosClient'
import { mockResolve, mockReject, createMockStore } from './mockAdapter'
import seedDisasters from '../mock/disasters.json'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' // live Spring Boot backend by default
const store = createMockStore(seedDisasters, 'dis')

/**
 * GET /disasters?status=&priority=&search=
 * success: { data: { items: Disaster[], total: number } }
 */
export async function getDisasters(params = {}) {
  if (USE_MOCKS) {
    let items = store.list()
    const { status, priority, search } = params
    if (status) items = items.filter((d) => d.status === status)
    if (priority) items = items.filter((d) => d.priority === priority)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((d) => d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q))
    }
    return mockResolve({ items, total: items.length })
  }
  const res = await axiosClient.get('/disasters', { params })
  return res.data
}

/**
 * GET /disasters/:id
 * success: { data: { disaster: Disaster } }
 */
export async function getDisasterById(id) {
  if (USE_MOCKS) {
    const disaster = store.get(id)
    if (!disaster) return mockReject('Disaster not found', 404)
    return mockResolve({ disaster })
  }
  const res = await axiosClient.get(`/disasters/${id}`)
  return res.data
}

/**
 * POST /disasters
 * body: { name, type, status, priority, affectedPopulation, location, lat, lng, requiredResources[], description }
 * success: { data: { disaster: Disaster } }
 */
export async function createDisaster(payload) {
  if (USE_MOCKS) {
    const disaster = store.create({ ...payload, startedAt: new Date().toISOString() })
    return mockResolve({ disaster }, 'Disaster created')
  }
  const res = await axiosClient.post('/disasters', payload)
  return res.data
}

/**
 * PUT /disasters/:id
 * body: Partial<Disaster>
 * success: { data: { disaster: Disaster } }
 */
export async function updateDisaster(id, payload) {
  if (USE_MOCKS) {
    const disaster = store.update(id, payload)
    if (!disaster) return mockReject('Disaster not found', 404)
    return mockResolve({ disaster }, 'Disaster updated')
  }
  const res = await axiosClient.put(`/disasters/${id}`, payload)
  return res.data
}

/**
 * DELETE /disasters/:id
 * success: { message: string }
 */
export async function deleteDisaster(id) {
  if (USE_MOCKS) {
    const existed = store.remove(id)
    if (!existed) return mockReject('Disaster not found', 404)
    return mockResolve(null, 'Disaster deleted')
  }
  const res = await axiosClient.delete(`/disasters/${id}`)
  return res.data
}
