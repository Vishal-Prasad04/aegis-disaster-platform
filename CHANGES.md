# Audit & Integration Report

Read alongside the root `README.md` (localhost setup + free hosting guide)
and `backend/README.md` (full backend reference).

## ⚠️ Sandbox constraint

The environment I did this work in has **no internet access and no Maven
binary installed** (`apt-get install maven` returns 403s from the package
mirror; `npm install` would fail fetching from `registry.npmjs.org` — both
confirmed blocked). I could not literally execute `mvn clean package` or
`npm run build` here.

Everything below comes from rigorous manual/static review: tracing every
`src/api/*.js` call against its controller, checking DTO field names,
verifying every relative import resolves, checking every npm dependency
import against `package.json`, and brace/package-declaration checks across
all 96 backend Java files. Please run the commands in the README yourself
as the real final check.

---

## This session's changes (no Docker, real-DB-ready, reduced seed data)

Per updated requirements: **all Docker files were removed** (Docker is now
explicitly unsupported/unnecessary for this project), the database
configuration was reworked so **no real credentials are baked in anywhere**
(placeholder values only — the app simply won't connect until you supply
your own MySQL details), and the seed data was **cut from ~29 users / 32
disasters / etc. down to 4 users (one per role) and 3 records per module**.

### Files removed
- `backend/Dockerfile`, `backend/.dockerignore`, `backend/docker-compose.yml`
- `frontend/Dockerfile`, `frontend/.dockerignore`, `frontend/nginx.conf`
- root `docker-compose.yml`, root `.env.example` (was Docker-compose-specific)

### Files changed
- `backend/src/main/resources/application.yml` — datasource block now uses
  placeholder-only defaults (`YOUR_DATABASE_HOST`, `YOUR_DATABASE_USERNAME`,
  etc.) instead of a working `root`/`root` default; added `DB_URL` support
  as a single full-JDBC-URL alternative to `DB_HOST`/`DB_PORT`/`DB_NAME`;
  JWT secret default changed to a clearly-labeled local-dev-only placeholder
- `backend/src/main/java/.../security/JwtService.java` — startup-warning
  check updated to match the new placeholder string
- `backend/src/main/java/.../config/DataSeeder.java` — rewritten from
  scratch: 4 users (one per role) instead of 29, 3 records per module
  instead of 14–40
- `backend/.env.example` — new; documents variable names (Spring Boot
  doesn't auto-load `.env` files — see README for how to actually supply them)
- `README.md` (root) — fully rewritten: Local Development Setup (6 numbered
  steps), Free Hosting / Production Setup, environment variable reference
  table — no Docker anywhere
- `backend/README.md` — fully rewritten to match: no Docker instructions,
  corrected demo credentials list (4 accounts, not 7), corrected DB config
  walkthrough

### Files kept from the earlier session (still relevant, not Docker-related)
- `frontend/vercel.json`, `frontend/public/_redirects` — SPA fallback for
  static hosting (Vercel/Netlify), unrelated to Docker, still needed for
  the free-hosting deployment path
- `frontend/.eslintrc.cjs` — `npm run lint` had no config at all before this
- All the frontend/backend integration fixes from the prior session (see
  below) — none of those were Docker-related and all still apply

---

## Integration fixes carried over from the prior audit (still in effect)

| Issue | Where | Fix |
|---|---|---|
| Unknown JSON properties (e.g. `id`) sent by every "Edit" form would 500 on save | Backend Jackson config | `fail-on-unknown-properties: false` |
| Refresh token issued by backend but never stored/used by frontend | `AuthContext.jsx`, `axiosClient.js` | Real refresh-on-401 flow with retry + redirect-to-login fallback |
| Deleting a record still referenced elsewhere threw a raw 500 with a SQL error | `GlobalExceptionHandler` | New `DataIntegrityViolationException` handler → clean 409 |
| Generic 500s leaked internal exception text to the client | `GlobalExceptionHandler` | Logged server-side only; generic safe message to client |
| Clearing a rescue team's disaster assignment silently failed to persist | `TeamService.update()` | `assignment` applied unconditionally (the one field where `null` is intentional) |
| `VITE_USE_MOCKS` documented but never actually read | `src/api/*.js` | Wired up for real |
| `clsx` listed as a dependency, never imported | `package.json` | Removed |
| Stale "Express" references (leftover from before the Spring Boot backend existed) | multiple comments/READMEs | Corrected |

### Verified correct, not a bug
- **Pagination** is entirely client-side (`usePagination` hook slices an
  already-fetched array) — the backend's "return everything matching the
  filter" design is exactly what's needed.
- **Enum/status labels** (`src/constants/index.js`) match backend enum
  labels exactly, verified field-by-field.
- **Response envelope shapes** — every single-item CRUD response nests
  under the correct singular key (`{ data: { resource: {...} } }`),
  verified against actual page component code.
- **Password exposure** — `User.password` is `@JsonIgnore`'d at the entity
  level and never included in any response DTO.

---

## Frontend ↔ Backend API mapping

| Frontend module | Calls | Backend controller |
|---|---|---|
| `authApi.js` | `POST /auth/login`, `/register`, `/refresh`, `/logout`, `GET /auth/me`, `PATCH /auth/users/:id/role` | `AuthController` |
| `disasterApi.js` | `GET/POST/PUT/DELETE /disasters` | `DisasterController` |
| `resourceApi.js` | `GET/POST/PUT/DELETE /resources` | `ResourceController` |
| `allocationApi.js` | `GET /allocations`, `POST /allocations/assign`, `PATCH /allocations/:id/status`, `GET /allocations/history` | `AllocationController` |
| `shelterApi.js` | `GET/POST/PUT/DELETE /shelters` | `ShelterController` |
| `teamApi.js` | `GET/POST/PUT/DELETE /teams`, `PATCH /teams/:id/assign` | `TeamController` |
| `alertApi.js` | `GET/POST/DELETE /alerts`, `PATCH /alerts/:id/status` | `AlertController` |
| `analyticsApi.js` | `GET /analytics/response-time`, `/resource-usage`, `/shelter-occupancy`, `/team-performance`, `/disaster-trends` | `AnalyticsController` |

---

## Environment variables you need to provide yourself

- `DB_URL` (or `DB_HOST` + `DB_NAME`) — your local (or cloud) MySQL location
- `DB_USERNAME` / `DB_PASSWORD` — your MySQL login (no default is shipped —
  the app will not connect without these)
- `JWT_SECRET` — required before deploying anywhere beyond localhost (a
  functional placeholder is used for local dev, with a startup warning)
- `CORS_ALLOWED_ORIGINS` — your deployed frontend URL, once hosted
- `VITE_API_URL` — your deployed backend URL, once hosted

Full details and exact commands: root `README.md`.

---

## Local development commands

```bash
# Backend
cd backend
mvn clean install
mvn spring-boot:run           # -> http://localhost:5000/api

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev                   # -> http://localhost:5173
```

## Production build commands (run these yourself — see constraint note above)

```bash
cd backend && mvn clean package && java -jar target/aegis-backend.jar
cd frontend && npm install && npm run build && npm run preview
```

## Free hosting steps

See root `README.md` → "Free Hosting / Production Setup" for the full
walkthrough (no Docker involved at any step).

## Demo login credentials (seeded intentionally)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@aegis.gov` | `admin123` |
| Coordinator | `coordinator@aegis.gov` | `coord123` |
| Field Officer | `field@aegis.gov` | `field123` |
| Volunteer | `volunteer@aegis.gov` | `vol123` |

## Remaining limitations

- **Builds not literally executed** in this sandbox — see the constraint
  note at the top. Please verify with the commands above.
- **No automated tests** were added.
- **No rate limiting** on auth endpoints — fine for a demo, worth adding
  before a real production launch.
- `frontend/routes/AdminRoute.jsx` exists but is unused/unwired (harmless —
  a role-gate component for a stricter admin section that was never built
  out). Left in place rather than deleted.
- `POST /auth/register` exists and works but has no frontend registration
  page — left in since it was explicitly requested in an earlier brief and
  is harmless to keep.
