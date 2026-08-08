import axiosClient from './axiosClient'
import { mockResolve } from './mockAdapter'
import analytics from '../mock/analytics.json'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' // live Spring Boot backend by default

/**
 * GET /analytics/response-time?range=7d
 * success: { data: { trend: { date: string, minutes: number }[] } }
 */
export async function getResponseTimeTrend(params = {}) {
  if (USE_MOCKS) return mockResolve({ trend: analytics.responseTimeTrend })
  const res = await axiosClient.get('/analytics/response-time', { params })
  return res.data
}

/**
 * GET /analytics/resource-usage
 * success: { data: { usage: { category: string, allocated: number, available: number }[] } }
 */
export async function getResourceUsage() {
  if (USE_MOCKS) return mockResolve({ usage: analytics.resourceUsageByCategory })
  const res = await axiosClient.get('/analytics/resource-usage')
  return res.data
}

/**
 * GET /analytics/shelter-occupancy?range=7d
 * success: { data: { trend: { date: string, occupancy: number }[] } }
 */
export async function getShelterOccupancyTrend(params = {}) {
  if (USE_MOCKS) return mockResolve({ trend: analytics.shelterOccupancyTrend })
  const res = await axiosClient.get('/analytics/shelter-occupancy', { params })
  return res.data
}

/**
 * GET /analytics/team-performance
 * success: { data: { performance: { team: string, tasksCompleted: number, avgResponseMin: number }[] } }
 */
export async function getTeamPerformance() {
  if (USE_MOCKS) return mockResolve({ performance: analytics.teamPerformance })
  const res = await axiosClient.get('/analytics/team-performance')
  return res.data
}

/**
 * GET /analytics/disaster-trends?range=6m
 * success: { data: { trend: { month: string, count: number }[] } }
 */
export async function getDisasterTrends(params = {}) {
  if (USE_MOCKS) return mockResolve({ trend: analytics.disasterTrends })
  const res = await axiosClient.get('/analytics/disaster-trends', { params })
  return res.data
}
