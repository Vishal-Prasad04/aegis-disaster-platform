# Aegis Disaster Resource Allocation Platform — Backend

Spring Boot 3 / Java 21 REST API for the Aegis frontend (`../frontend`).
JWT authentication, role-based authorization, full CRUD for every module
the frontend uses, and a small set of seed data so the app isn't empty on
first run. No Docker required — runs directly with Maven against your own
local MySQL installation.

---

## 1. Tech Stack

- Java 21, Spring Boot 3.3
- Spring Web, Spring Data JPA, Spring Security, Bean Validation
- MySQL 8 (via `mysql-connector-j`)
- JWT auth (`jjwt` 0.12)
- springdoc-openapi (Swagger UI)
- Lombok, Maven

Layered architecture: `controller → service → repository → entity`, with
separate `dto` (request/response), `mapper`, `config`, `security`,
`exception`, and `util` packages.

---

## 2. Requirements

- JDK 21+
- Maven 3.9+
- A local MySQL 8+ installation (MySQL Workbench, `mysql` CLI, XAMPP, etc. —
  whatever you already use)

---

## 3. Database Setup

1. Create a database using your own MySQL client, e.g.:
   ```sql
   CREATE DATABASE aegis_db;
   ```
   (Any name works — you'll tell the backend what you called it in the
   next step. `spring.jpa.hibernate.ddl-auto=update` creates all the
   tables automatically the first time the app connects — no manual
   schema scripts needed.)

2. Configure your own credentials — see section 4.

**Do not use your real MySQL root password anywhere in this repo.** If you
don't already have a dedicated database user, consider creating one just
for this app:
```sql
CREATE USER 'aegis_app'@'localhost' IDENTIFIED BY 'choose-your-own-password';
GRANT ALL PRIVILEGES ON aegis_db.* TO 'aegis_app'@'localhost';
FLUSH PRIVILEGES;
```

---

## 4. Environment Variables — enter your own MySQL details here

**Nothing in this project contains a real, working database credential.**
`src/main/resources/application.yml` uses placeholder values
(`YOUR_DATABASE_HOST`, `YOUR_DATABASE_USERNAME`, etc.) that will simply fail
to connect until you supply your own. `.env.example` documents the same
variable names for reference — **Spring Boot does not read `.env` files
automatically**, so pick one of these two ways to actually supply them:

**Option A (simplest) — edit `application.yml` directly.** Open
`src/main/resources/application.yml` and replace the placeholder defaults
in the `spring.datasource` block with your own values in place.

**Option B — set real OS environment variables** before running the app
(useful if you don't want credentials sitting in a tracked file at all):
```bash
export DB_URL="jdbc:mysql://localhost:3306/aegis_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME="your_mysql_username"
export DB_PASSWORD="your_mysql_password"
mvn spring-boot:run
```
(On Windows PowerShell, use `$env:DB_URL = "..."` etc.)

| Variable | Local example value | Notes |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/aegis_db?...` | full JDBC URL — if set, this takes priority over `DB_HOST`/`DB_PORT`/`DB_NAME` |
| `DB_HOST` | `localhost` | only used if `DB_URL` is unset |
| `DB_PORT` | `3306` | only used if `DB_URL` is unset |
| `DB_NAME` | `aegis_db` | only used if `DB_URL` is unset |
| `DB_USERNAME` | *your MySQL username* | **required** — replace the placeholder |
| `DB_PASSWORD` | *your MySQL password* | **required** — replace the placeholder |
| `JWT_SECRET` | any long random string | works out of the box with a dev-only placeholder; the app logs a startup warning until you change it |
| `JWT_ACCESS_EXPIRATION` | `86400000` (24h, ms) | optional |
| `JWT_REFRESH_EXPIRATION` | `604800000` (7d, ms) | optional |
| `SERVER_PORT` | `5000` | this project runs the API on **5000**, not Spring's default 8080 — see note below |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | comma-separated, no trailing slash |
| `SEED_ENABLED` | `true` | set `false` to skip demo-data seeding |

> **Port note:** the frontend's `VITE_API_URL` default is already wired to
> `http://localhost:5000/api` to match this backend's configured port — you
> don't need to change either side for local development.

---

## 5. Running the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

On first startup you'll see log lines confirming the demo data seed ran:
```
Seeding a small set of Aegis demo data...
Seed complete.
```
The API is now live at `http://localhost:5000/api`.
Swagger UI: **http://localhost:5000/api/swagger-ui.html**
OpenAPI JSON: `http://localhost:5000/api/v3/api-docs`

To re-seed from scratch, drop the database (or truncate its tables) and
restart — the seeder only runs when the `users` table is empty, so it never
creates duplicate records on repeat startups.

---

## 6. Running the Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL already defaults to http://localhost:5000/api
npm run dev
```

Open `http://localhost:5173` and log in with any demo account below.

---

## 7. Demo Login Credentials

One seeded account per role — enough to exercise every permission path in
the UI without generating filler data:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@aegis.gov` | `admin123` |
| Coordinator | `coordinator@aegis.gov` | `coord123` |
| Field Officer | `field@aegis.gov` | `field123` |
| Volunteer | `volunteer@aegis.gov` | `vol123` |

All passwords are stored BCrypt-encrypted in the database.

---

## 8. Roles & Authorization

The frontend defines four roles (see `src/constants` in the frontend), so
the backend implements exactly these:

- `ADMIN` — full access, including user management and deletes
- `COORDINATOR` — create/update disasters, resources, shelters, teams, alerts
- `FIELD_OFFICER` — assign resources, update allocation/alert status
- `VOLUNTEER` — read access to all operational data

Method-level `@PreAuthorize` checks enforce this on every mutating endpoint.
Public (no-auth) endpoints: `POST /auth/login`, `POST /auth/register`,
`POST /auth/refresh`, and the Swagger UI/docs routes.

---

## 9. Seeded Demo Data

Deliberately small — just enough for every screen to render something real
without drowning a real deployment in fake records:

- **4 users**, one per role (see credentials above)
- **3 disaster reports** (a flood, a landslide, a heatwave) with map coordinates
- **3 resource inventory items** (water, food, medical)
- **3 shelters**, each linked to a disaster
- **3 rescue teams**, two deployed and one on standby
- **3 resource allocations** across different statuses
- **3 alerts** across different statuses

Set `SEED_ENABLED=false` once you're working with real data.

---

## 10. API Overview

All endpoints are prefixed with `/api`. Full interactive documentation is
available in Swagger UI once the app is running.

| Module | Base path | Notes |
|---|---|---|
| Auth | `/auth` | login, register, refresh, logout, me, role update |
| Users | `/users` | Admin-only list/get/delete |
| Profile | `/profile` | current user's own profile |
| Disasters | `/disasters` | CRUD + filter by status/priority/search |
| Resources | `/resources` | CRUD + filter by search/category/status |
| Allocations | `/allocations` | assign, status update, history |
| Shelters | `/shelters` | CRUD + filter by disaster |
| Rescue Teams | `/teams` | CRUD + assign/unassign to disaster |
| Alerts | `/alerts` | create, status update, delete |
| Analytics | `/analytics` | response-time, resource-usage, shelter-occupancy, team-performance, disaster-trends |
| Dashboard | `/dashboard/stats` | aggregated stats + recent activity (bonus endpoint) |

Every successful response follows the envelope the frontend expects:
`{ "data": { ... }, "message": "..." }`. List endpoints nest as
`{ "data": { "items": [...], "total": n } }`. Single-item endpoints nest
under a named key matching the resource, e.g.
`{ "data": { "disaster": {...} } }`.

Errors follow a consistent shape with meaningful, user-safe messages and
correct HTTP status codes (400 validation, 401 unauthorized, 403 forbidden,
404 not found, 409 conflict).

---

## 11. Project Structure

```
backend/
├── pom.xml
├── .env.example
├── src/main/java/com/aegis/backend/
│   ├── AegisBackendApplication.java
│   ├── config/           # Security, OpenAPI, DataSeeder
│   ├── controller/        # REST endpoints
│   ├── service/           # business logic
│   ├── repository/        # Spring Data JPA repositories
│   ├── entity/             # JPA entities
│   ├── enums/              # Role, DisasterStatus, Priority, etc.
│   ├── dto/request/       # validated request bodies
│   ├── dto/response/      # response DTOs
│   ├── mapper/             # entity → DTO mapping
│   ├── security/           # JWT filter, UserDetails, JwtService
│   ├── exception/          # custom exceptions + global handler
│   └── util/                # SecurityUtils
└── src/main/resources/application.yml
```

---

## 12. Design Notes

- IDs are UUID strings (`GenerationType.UUID`) for all entities.
- Relationships: `Allocation` → `Resource` / `Disaster` (ManyToOne),
  `Shelter` → `Disaster` (ManyToOne, nullable), `RescueTeam` → `Disaster`
  (ManyToOne, nullable, "assignment"), `Disaster.requiredResources` is an
  `@ElementCollection` of strings.
- Assigning a resource to a disaster (`POST /allocations/assign`) atomically
  decrements the resource's stock and returns `409 Conflict` if the
  requested quantity exceeds what's available. Rejecting an allocation
  returns the stock to the pool.

---

## 13. Building a Deployable JAR

```bash
mvn clean package
java -jar target/aegis-backend.jar
```
All configuration is read from environment variables at runtime — the JAR
itself contains no environment-specific values other than the documented
dev-only placeholder defaults.

---

## 14. Hardening Notes

- **Unknown JSON properties don't break edit saves.** The frontend's edit
  forms send the full fetched object back on update (including server-only
  fields like `id`), so `fail-on-unknown-properties: false` is set in
  `application.yml`.
- **Foreign-key violations return a clean 409**, not a raw 500 with a SQL
  error message (e.g. deleting a Disaster that still has Shelters/Rescue
  Teams/Alerts/Allocations referencing it).
- **Generic 500 errors never leak internal exception text** to the client;
  full details are logged server-side via SLF4J instead.
- **`JwtService` logs a startup warning** if `JWT_SECRET` is still the
  built-in development placeholder.
