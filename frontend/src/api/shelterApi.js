import axiosClient from './axiosClient'
import { mockResolve, mockReject, createMockStore } from './mockAdapter'
import seedShelters from '../mock/shelters.json'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' // live Spring Boot backend by default
const store = createMockStore(seedShelters, 'shl')

/**
 * GET /shelters?disasterId=
 * success: { data: { items: Shelter[], total: number } }
 */
export async function getShelters(params = {}) {
  if (USE_MOCKS) {
    let items = store.list()
    if (params.disasterId) items = items.filter((s) => s.disasterId === params.disasterId)
    return mockResolve({ items, total: items.length })
  }
  const res = await axiosClient.get('/shelters', { params })
  return res.data
}

/**
 * POST /shelters
 * body: { name, location, capacity, occupancy, food, water, medical, disasterId }
 * success: { data: { shelter: Shelter } }
 */
export async function createShelter(payload) {
  if (USE_MOCKS) {
    const shelter = store.create(payload)
    return mockResolve({ shelter }, 'Shelter added')
  }
  const res = await axiosClient.post('/shelters', payload)
  return res.data
}

/**
 * PUT /shelters/:id
 * body: Partial<Shelter>
 * success: { data: { shelter: Shelter } }
 */
export async function updateShelter(id, payload) {
  if (USE_MOCKS) {
    const shelter = store.update(id, payload)
    if (!shelter) return mockReject('Shelter not found', 404)
    return mockResolve({ shelter }, 'Shelter updated')
  }
  const res = await axiosClient.put(`/shelters/${id}`, payload)
  return res.data
}

/**
 * DELETE /shelters/:id
 * success: { message: string }
 */
export async function deleteShelter(id) {
  if (USE_MOCKS) {
    const existed = store.remove(id)
    if (!existed) return mockReject('Shelter not found', 404)
    return mockResolve(null, 'Shelter removed')
  }
  const res = await axiosClient.delete(`/shelters/${id}`)
  return res.data
}
