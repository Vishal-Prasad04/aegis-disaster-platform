// Wraps mock data so every *Api.js function resolves with the same shape
// a real backend + Axios call would: { data, message }. Swap the internals
// of each api function for a real axiosClient call later — callers never change.

const LATENCY_MS = 350

export function mockResolve(payload, message = 'OK') {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: payload, message }), LATENCY_MS)
  })
}

export function mockReject(message = 'Something went wrong', status = 400) {
  return new Promise((_, reject) => {
    setTimeout(() => reject({ message, response: { status, data: { message } } }), LATENCY_MS)
  })
}

// In-memory CRUD store seeded from a mock JSON file. Lives for the tab's
// session only — a real backend replaces this with actual persistence.
export function createMockStore(seedData, idPrefix) {
  let items = [...seedData]

  return {
    list() {
      return [...items]
    },
    get(id) {
      return items.find((item) => item.id === id) || null
    },
    create(payload) {
      const newItem = { id: `${idPrefix}_${Date.now().toString(36)}`, ...payload }
      items = [newItem, ...items]
      return newItem
    },
    update(id, payload) {
      let updated = null
      items = items.map((item) => {
        if (item.id === id) {
          updated = { ...item, ...payload }
          return updated
        }
        return item
      })
      return updated
    },
    remove(id) {
      const existed = items.some((item) => item.id === id)
      items = items.filter((item) => item.id !== id)
      return existed
    },
  }
}
