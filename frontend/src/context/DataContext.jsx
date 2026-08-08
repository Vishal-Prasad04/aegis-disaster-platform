import { createContext, useContext, useState, useCallback } from 'react'
import * as disasterApi from '../api/disasterApi'
import * as resourceApi from '../api/resourceApi'
import * as shelterApi from '../api/shelterApi'
import * as teamApi from '../api/teamApi'
import * as alertApi from '../api/alertApi'
import * as allocationApi from '../api/allocationApi'

const DataContext = createContext(null)

// Central store so pages/components never import mock JSON or call *Api.js
// directly. Every domain slice exposes: state, loading flag, and a
// refresh/mutate function. Swapping the underlying api/*.js implementation
// to hit a real backend requires zero changes here.
export function DataProvider({ children }) {
  const [disasters, setDisasters] = useState([])
  const [resources, setResources] = useState([])
  const [shelters, setShelters] = useState([])
  const [teams, setTeams] = useState([])
  const [alerts, setAlerts] = useState([])
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState({})

  const withLoading = useCallback((key, fn) => async (...args) => {
    setLoading((prev) => ({ ...prev, [key]: true }))
    try {
      return await fn(...args)
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }))
    }
  }, [])

  const fetchDisasters = useCallback(
    withLoading('disasters', async (params) => {
      const { data } = await disasterApi.getDisasters(params)
      setDisasters(data.items)
      return data.items
    }),
    [withLoading],
  )

  const fetchResources = useCallback(
    withLoading('resources', async (params) => {
      const { data } = await resourceApi.getResources(params)
      setResources(data.items)
      return data.items
    }),
    [withLoading],
  )

  const fetchShelters = useCallback(
    withLoading('shelters', async (params) => {
      const { data } = await shelterApi.getShelters(params)
      setShelters(data.items)
      return data.items
    }),
    [withLoading],
  )

  const fetchTeams = useCallback(
    withLoading('teams', async (params) => {
      const { data } = await teamApi.getTeams(params)
      setTeams(data.items)
      return data.items
    }),
    [withLoading],
  )

  const fetchAlerts = useCallback(
    withLoading('alerts', async (params) => {
      const { data } = await alertApi.getAlerts(params)
      setAlerts(data.items)
      return data.items
    }),
    [withLoading],
  )

  const fetchAllocations = useCallback(
    withLoading('allocations', async (params) => {
      const { data } = await allocationApi.getAllocations(params)
      setAllocations(data.items)
      return data.items
    }),
    [withLoading],
  )

  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetchDisasters(),
      fetchResources(),
      fetchShelters(),
      fetchTeams(),
      fetchAlerts(),
      fetchAllocations(),
    ])
  }, [fetchDisasters, fetchResources, fetchShelters, fetchTeams, fetchAlerts, fetchAllocations])

  const value = {
    disasters,
    resources,
    shelters,
    teams,
    alerts,
    allocations,
    loading,
    fetchDisasters,
    fetchResources,
    fetchShelters,
    fetchTeams,
    fetchAlerts,
    fetchAllocations,
    fetchAll,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
