# Aegis Disaster Resource Allocation Platform

A full-stack disaster management command platform:

```
React/Vite Frontend  →  http://localhost:5173
        ↓
Spring Boot REST API →  http://localhost:5000/api
        ↓
MySQL Database
```

> **Note on ports:** this project already had its backend configured to run
> on port **5000** (not Spring Boot's default 8080), with the frontend's
> `VITE_API_URL` wired to match — that pairing is kept as-is so nothing
> breaks. If you'd rather use 8080, see the `SERVER_PORT` variable below.

No Docker is required or used anywhere in this project — everything runs
directly with Node/npm and Java/Maven against a MySQL instance you control.

- **`backend/`** — Spring Boot 3 / Java 21 REST API. See `backend/README.md`
  for the full backend reference (API docs, roles, seed data details).
- **`frontend/`** — React/Vite frontend. UI, routes, pages, and components
  are unchanged from the original design.

---

## Local Development Setup

### Requirements

- **Node.js** 18+ and **npm**
- **Java** 21 (JDK)
- **Maven** 3.9+
- **MySQL** 8+ installed and running locally

### Step 1 — Install dependencies

```bash
git clone <this-repo>
cd aegis-disaster-platform

cd backend && mvn -q -DskipTests dependency:go-offline && cd ..
cd frontend && npm install && cd ..
```

### Step 2 — Create your MySQL database

Using your own MySQL client (Workbench, CLI, XAMPP, etc.):

```sql
CREATE DATABASE aegis_db;
```

Any database name works — you'll tell the backend what you called it in
the next step. Tables are created automatically on first startup; no
manual schema scripts are needed.

### Step 3 — Add your own database credentials

**This project never contains real database credentials — only
placeholders.** Nothing will connect until you enter your own.

Open `backend/src/main/resources/application.yml` and replace the
placeholder values in the `spring.datasource` block:

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:mysql://${DB_HOST:YOUR_DATABASE_HOST}:${DB_PORT:3306}/${DB_NAME:YOUR_DATABASE_NAME}?...}
    username: ${DB_USERNAME:YOUR_DATABASE_USERNAME}
    password: ${DB_PASSWORD:YOUR_DATABASE_PASSWORD}
```

The simplest local setup: replace `YOUR_DATABASE_HOST` with `localhost`,
`YOUR_DATABASE_NAME` with `aegis_db` (or whatever you named it in Step 2),
and `YOUR_DATABASE_USERNAME` / `YOUR_DATABASE_PASSWORD` with your actual
MySQL login.

**Replace the placeholder values with your own MySQL database details —
do not commit real credentials.** If you'd rather not edit the file
directly, you can instead export real environment variables before
starting the backend (see `backend/.env.example` for the full list of
variable names, and `backend/README.md` §4 for exact commands) — Spring
Boot reads `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` etc. from the environment
automatically if they're set.

### Step 4 — Start the backend

```bash
cd backend
mvn spring-boot:run
```

Wait for `Seed complete.` in the logs — this means it connected to MySQL
successfully and seeded a small set of demo data.

### Step 5 — Start the frontend

```bash
cd frontend
cp .env.example .env
npm run dev
```

### Step 6 — Open the application

**http://localhost:5173**

Log in with any demo account (see `backend/README.md` §7), e.g.
**`admin@aegis.gov` / `admin123`**.

---

## Free Hosting / Production Setup

You can deploy this without Docker. General flow:

```
GitHub
   ↓
Deploy Spring Boot backend  (Render / Railway / Fly.io — any host that can build/run a Java app or JAR)
   ↓
Connect a cloud MySQL instance  (PlanetScale / Railway MySQL / Aiven / any managed MySQL)
   ↓
Add DB credentials as environment variables on the hosting platform
   ↓
Get your backend's public URL
   ↓
Deploy the React/Vite frontend  (Vercel / Netlify / Cloudflare Pages)
   ↓
Set VITE_API_URL to your backend's public URL + /api
   ↓
Set the backend's CORS_ALLOWED_ORIGINS to your deployed frontend URL
   ↓
Test the application
```

### What changes when moving from localhost to hosting

**Backend** — set these as environment variables in your hosting
platform's dashboard (not in any committed file):

| | Local | Production |
|---|---|---|
| Database | `DB_URL=jdbc:mysql://localhost:3306/aegis_db?...` | `DB_URL=<your cloud MySQL connection string>` |
| JWT | `JWT_SECRET=<any placeholder>` | `JWT_SECRET=<a long, random, real secret — generate one, don't reuse the local one>` |
| CORS | `CORS_ALLOWED_ORIGINS=http://localhost:5173` | `CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND-DOMAIN` |

Most Java-friendly free/low-cost hosts (Render, Railway, Fly.io) build
directly from `backend/` using `mvn clean package` and run the resulting
JAR — no Dockerfile needed, just point the platform's build command at
Maven and its start command at `java -jar target/aegis-backend.jar`.

**Frontend** — set the build-time environment variable in your static
host's dashboard *before* building (Vite inlines it at build time, not at
request time):

| | Local | Production |
|---|---|---|
| API URL | `VITE_API_URL=http://localhost:5000/api` | `VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api` |

Build command: `npm run build`. Output directory: `dist`. A
`vercel.json` (Vercel) and `public/_redirects` (Netlify) are already
included so direct navigation to routes like `/dashboard` or `/analytics`
works correctly on either platform without any extra configuration.

**Database** — any managed MySQL 8 instance works (PlanetScale, Railway
MySQL, Aiven, AWS RDS, etc.). `ddl-auto=update` creates the schema
automatically on first connection, same as locally.

---

## Environment Variables Reference

| Variable | Local value | Production value | Where it's set |
|---|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | `https://YOUR-BACKEND-DOMAIN/api` | `frontend/.env` (local) or your static host's env settings (production) |
| `DB_URL` | `jdbc:mysql://localhost:3306/aegis_db?...` | your cloud MySQL connection string | `backend/application.yml` (local) or your backend host's env settings (production) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `localhost` / `3306` / `aegis_db` | your cloud DB's host / port / name | same as above (only used if `DB_URL` unset) |
| `DB_USERNAME` | *your local MySQL username* | *your cloud DB username* | same as above |
| `DB_PASSWORD` | *your local MySQL password* | *your cloud DB password* | same as above |
| `JWT_SECRET` | any local placeholder | a long, random, real secret | same as above |
| `SERVER_PORT` | `5000` | as required by your host | same as above |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | `https://YOUR-FRONTEND-DOMAIN` | same as above |
| `SEED_ENABLED` | `true` | `false` once you have real data | same as above |

**You need to replace/provide, yourself:** `DB_URL` (or
`DB_HOST`/`DB_NAME`), `DB_USERNAME`, `DB_PASSWORD` (always — no working
default is shipped), and `JWT_SECRET` + `CORS_ALLOWED_ORIGINS` +
`VITE_API_URL` (before deploying anywhere beyond localhost).

---

## More

- `CHANGES.md` — full audit findings: what was reviewed, what was fixed,
  file list, and API mapping.
- `backend/README.md` — backend-specific setup, demo credentials, API docs.
- `frontend/README.md` — frontend architecture and API contract reference.
