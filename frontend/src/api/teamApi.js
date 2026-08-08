import axiosClient from './axiosClient'
import { mockResolve, mockReject, createMockStore } from './mockAdapter'
import seedTeams from '../mock/teams.json'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' // live Spring Boot backend by default
const store = createMockStore(seedTeams, 'tm')

/**
 * GET /teams?status=&assignment=
 * success: { data: { items: Team[], total: number } }
 */
export async function getTeams(params = {}) {
  if (USE_MOCKS) {
    let items = store.list()
    if (params.status) items = items.filter((t) => t.status === params.status)
    if (params.assignment) items = items.filter((t) => t.assignment === params.assignment)
    return mockResolve({ items, total: items.length })
  }
  const res = await axiosClient.get('/teams', { params })
  return res.data
}

/**
 * POST /teams
 * body: { name, members, vehicle, status, assignment, currentLocation, leader }
 * success: { data: { team: Team } }
 */
export async function createTeam(payload) {
  if (USE_MOCKS) {
    const team = store.create(payload)
    return mockResolve({ team }, 'Team registered')
  }
  const res = await axiosClient.post('/teams', payload)
  return res.data
}

/**
 * PUT /teams/:id
 * body: Partial<Team>
 * success: { data: { team: Team } }
 */
export async function updateTeam(id, payload) {
  if (USE_MOCKS) {
    const team = store.update(id, payload)
    if (!team) return mockReject('Team not found', 404)
    return mockResolve({ team }, 'Team updated')
  }
  const res = await axiosClient.put(`/teams/${id}`, payload)
  return res.data
}

/**
 * PATCH /teams/:id/assign
 * body: { disasterId: string | null }
 * success: { data: { team: Team } }
 */
export async function assignTeam(id, disasterId) {
  if (USE_MOCKS) {
    const team = store.update(id, { assignment: disasterId, status: disasterId ? 'Deployed' : 'Standby' })
    if (!team) return mockReject('Team not found', 404)
    return mockResolve({ team }, 'Team assignment updated')
  }
  const res = await axiosClient.patch(`/teams/${id}/assign`, { disasterId })
  return res.data
}

/**
 * DELETE /teams/:id
 * success: { message: string }
 */
export async function deleteTeam(id) {
  if (USE_MOCKS) {
    const existed = store.remove(id)
    if (!existed) return mockReject('Team not found', 404)
    return mockResolve(null, 'Team removed')
  }
  const res = await axiosClient.delete(`/teams/${id}`)
  return res.data
}
