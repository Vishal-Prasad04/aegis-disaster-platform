# Aegis — Disaster Resource Allocation Platform (Frontend)

React frontend for a disaster management command platform, now integrated
with the real Spring Boot backend in `../backend`. Every screen is wired to
an `api/*.js` service file that calls the live API by default; each file
also ships a mock-data fallback (shaped identically to the real
`{ data, message }` response envelope) that can be switched on for
frontend-only development via `VITE_USE_MOCKS=true` — no component, page,
or context needs to change either way.

## Getting started

```bash
npm install
cp .env.example .env   # defaults already point at the local backend on :5000
npm run dev
```

Requires the backend (`../backend`) running on the URL configured by
`VITE_API_URL` — see the top-level `README.md` for the full local setup.

Demo accounts (see the login screen): `admin@aegis.gov` / `admin123`,
`coordinator@aegis.gov` / `coord123`, `field@aegis.gov` / `field123`,
`volunteer@aegis.gov` / `vol123`.

## Architecture

```
src/
  api/          axios instance + one *Api.js file per domain (the contract layer)
  mock/         mock JSON "database" — the only place mock data lives
  context/      AuthContext, UIContext, DataContext (React Context API)
  components/
    common/     Button, Card, Table, Pagination, Filters, SearchBar, Modal,
                Input, Dropdown, StatusBadge, Loader, EmptyState,
                ErrorComponent, Toast
    layout/     Navbar, Sidebar, Breadcrumb
  layouts/      DashboardLayout (authenticated shell), AuthLayout (login shell)
  pages/        one file per route
  routes/       AppRoutes, PrivateRoute, AdminRoute
  hooks/        useForm, usePagination, useDebounce
  constants/    roles, statuses, priorities, status→color mapping
  utils/        formatters, validators, sorting/pagination helpers
```

**Rule followed throughout:** components never import mock JSON and never call
`axios` directly. They call a function from `api/*.js`, which calls the real
Spring Boot backend (or resolves bundled mock data if `VITE_USE_MOCKS=true`).
`DataContext` also exists as a shared store for cross-page data (used by the
Dashboard) so multiple pages don't duplicate fetches.

## Roles

`Admin`, `Coordinator`, `Field Officer`, `Volunteer` — defined in
`src/constants/index.js`. `AuthContext.hasRole()` gates any role-specific UI (see
the Role Management section on the Settings page, visible to Admins only).

---

## API Contract (for backend handoff)

Base URL: `VITE_API_URL` (default `http://localhost:5000/api`). All responses use
the envelope `{ data, message }` on success. Errors return `{ message }` with an
appropriate HTTP status; the axios interceptor in `api/axiosClient.js` normalizes
`error.message` for every caller.

### Auth — `api/authApi.js`
| Function | Method | Endpoint | Body | Success |
|---|---|---|---|---|
| `login` | POST | `/auth/login` | `{ email, password }` | `{ user, token }` (401 on bad creds) |
| `logout` | POST | `/auth/logout` | — | `{ message }` |
| `getCurrentUser` | GET | `/auth/me` | — (bearer token) | `{ user }` (401 if expired) |
| `updateUserRole` | PATCH | `/auth/users/:id/role` | `{ role }` | `{ user }` |

### Disasters — `api/disasterApi.js`
| Function | Method | Endpoint | Body | Success |
|---|---|---|---|---|
| `getDisasters` | GET | `/disasters?status=&priority=&search=` | — | `{ items, total }` |
| `getDisasterById` | GET | `/disasters/:id` | — | `{ disaster }` (404) |
| `createDisaster` | POST | `/disasters` | `{ name, type, status, priority, affectedPopulation, location, lat, lng, requiredResources[], description }` | `{ disaster }` |
| `updateDisaster` | PUT | `/disasters/:id` | `Partial<Disaster>` | `{ disaster }` |
| `deleteDisaster` | DELETE | `/disasters/:id` | — | `{ message }` |

### Resources — `api/resourceApi.js`
| Function | Method | Endpoint | Body | Success |
|---|---|---|---|---|
| `getResources` | GET | `/resources?search=&category=&status=` | — | `{ items, total }` |
| `getResourceById` | GET | `/resources/:id` | — | `{ resource }` (404) |
| `createResource` | POST | `/resources` | `{ name, category, quantity, unit, status, warehouse }` | `{ resource }` |
| `updateResource` | PUT | `/resources/:id` | `Partial<Resource>` | `{ resource }` |
| `deleteResource` | DELETE | `/resources/:id` | — | `{ message }` |

### Allocations — `api/allocationApi.js`
| Function | Method | Endpoint | Body | Success |
|---|---|---|---|---|
| `getAllocations` | GET | `/allocations?status=&disasterId=` | — | `{ items, total }` |
| `assignResource` | POST | `/allocations/assign` | `{ resourceId, disasterId, quantity, requestedBy }` | `{ allocation }` (409 if over stock) |
| `updateAllocationStatus` | PATCH | `/allocations/:id/status` | `{ status }` | `{ allocation }` |
| `getAllocationHistory` | GET | `/allocations/history?disasterId=` | — | `{ items }` (Completed/Rejected only) |

### Shelters — `api/shelterApi.js`
| Function | Method | Endpoint | Body | Success |
|---|---|---|---|---|
| `getShelters` | GET | `/shelters?disasterId=` | — | `{ items, total }` |
| `createShelter` | POST | `/shelters` | `{ name, location, capacity, occupancy, food, water, medical, disasterId }` | `{ shelter }` |
| `updateShelter` | PUT | `/shelters/:id` | `Partial<Shelter>` | `{ shelter }` |
| `deleteShelter` | DELETE | `/shelters/:id` | — | `{ message }` |

### Rescue Teams — `api/teamApi.js`
| Function | Method | Endpoint | Body | Success |
|---|---|---|---|---|
| `getTeams` | GET | `/teams?status=&assignment=` | — | `{ items, total }` |
| `createTeam` | POST | `/teams` | `{ name, members, vehicle, status, assignment, currentLocation, leader }` | `{ team }` |
| `updateTeam` | PUT | `/teams/:id` | `Partial<Team>` | `{ team }` |
| `assignTeam` | PATCH | `/teams/:id/assign` | `{ disasterId }` | `{ team }` |
| `deleteTeam` | DELETE | `/teams/:id` | — | `{ message }` |

### Alerts — `api/alertApi.js`
| Function | Method | Endpoint | Body | Success |
|---|---|---|---|---|
| `getAlerts` | GET | `/alerts?status=&priority=` | — | `{ items, total }` |
| `createAlert` | POST | `/alerts` | `{ title, priority, disasterId, description }` | `{ alert }` |
| `updateAlertStatus` | PATCH | `/alerts/:id/status` | `{ status }` | `{ alert }` |
| `deleteAlert` | DELETE | `/alerts/:id` | — | `{ message }` |

### Analytics — `api/analyticsApi.js`
| Function | Method | Endpoint | Success |
|---|---|---|---|
| `getResponseTimeTrend` | GET | `/analytics/response-time?range=7d` | `{ trend: [{date, minutes}] }` |
| `getResourceUsage` | GET | `/analytics/resource-usage` | `{ usage: [{category, allocated, available}] }` |
| `getShelterOccupancyTrend` | GET | `/analytics/shelter-occupancy?range=7d` | `{ trend: [{date, occupancy}] }` |
| `getTeamPerformance` | GET | `/analytics/team-performance` | `{ performance: [{team, tasksCompleted, avgResponseMin}] }` |
| `getDisasterTrends` | GET | `/analytics/disaster-trends?range=6m` | `{ trend: [{month, count}] }` |

### Enums (shared with backend)
- `role`: Admin, Coordinator, Field Officer, Volunteer
- `disaster.status`: Active, Monitoring, Contained, Resolved
- `priority`: Critical, High, Medium, Low
- `resource.status`: Available, Allocated, In Transit, Depleted
- `allocation.status`: Pending, Approved, In Progress, Completed, Rejected
- `team.status`: On Duty, Deployed, Standby, Off Duty
- `alert.status`: Open, Acknowledged, Resolved

---

## Backend

The table above is the exact contract implemented by `../backend` (Spring
Boot 3 / Java 21). See `../backend/README.md` for setup, demo credentials,
and full API docs (Swagger UI at `/api/swagger-ui.html` once it's running).
