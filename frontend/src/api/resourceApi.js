import axiosClient from './axiosClient'
import { mockResolve, mockReject, createMockStore } from './mockAdapter'
import seedResources from '../mock/resources.json'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' // live Spring Boot backend by default
const store = createMockStore(seedResources, 'res')

/**
 * GET /resources?search=&category=&status=&page=&pageSize=
 * success: { data: { items: Resource[], total: number } }
 */
export async function getResources(params = {}) {
  if (USE_MOCKS) {
    let items = store.list()
    const { search, category, status } = params
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((r) => r.name.toLowerCase().includes(q))
    }
    if (category) items = items.filter((r) => r.category === category)
    if (status) items = items.filter((r) => r.status === status)
    return mockResolve({ items, total: items.length })
  }
  const res = await axiosClient.get('/resources', { params })
  return res.data
}

/**
 * GET /resources/:id
 * success: { data: { resource: Resource } }
 * error: 404 if not found
 */
export async function getResourceById(id) {
  if (USE_MOCKS) {
    const resource = store.get(id)
    if (!resource) return mockReject('Resource not found', 404)
    return mockResolve({ resource })
  }
  const res = await axiosClient.get(`/resources/${id}`)
  return res.data
}

/**
 * POST /resources
 * body: { name, category, quantity, unit, status, warehouse }
 * success: { data: { resource: Resource } }
 */
export async function createResource(payload) {
  if (USE_MOCKS) {
    const resource = store.create({ ...payload, updatedAt: new Date().toISOString() })
    return mockResolve({ resource }, 'Resource created')
  }
  const res = await axiosClient.post('/resources', payload)
  return res.data
}

/**
 * PUT /resources/:id
 * body: Partial<Resource>
 * success: { data: { resource: Resource } }
 */
export async function updateResource(id, payload) {
  if (USE_MOCKS) {
    const resource = store.update(id, { ...payload, updatedAt: new Date().toISOString() })
    if (!resource) return mockReject('Resource not found', 404)
    return mockResolve({ resource }, 'Resource updated')
  }
  const res = await axiosClient.put(`/resources/${id}`, payload)
  return res.data
}

/**
 * DELETE /resources/:id
 * success: { message: string }
 */
export async function deleteResource(id) {
  if (USE_MOCKS) {
    const existed = store.remove(id)
    if (!existed) return mockReject('Resource not found', 404)
    return mockResolve(null, 'Resource deleted')
  }
  const res = await axiosClient.delete(`/resources/${id}`)
  return res.data
}
