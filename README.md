# Go CRM – Student Recruitment Leads (Gin + GORM + Postgres)

A small CRM to replace error-prone Excel workflows for a student recruitment company.  
Employees can add leads during calls and coordinators can filter/search & update them later.

## ✨ Features

- Go (Gin) API with GORM/PostgreSQL
- Auth: JWT + Role-based access (admin, coordinator, agent, viewer)
- Leads CRUD with filters (q, country, status, date range)
- Dockerized stack + two workflows:
  - **Prod-like** image (multi-stage Dockerfile → tiny, secure)
  - **Dev** (compose-only `go run` for fast iteration)
- Adminer DB UI

---

## 🧱 Architecture

Client (curl/Postman/Frontend)
│
▼
Go API (Gin, GORM) ←→ PostgreSQL (db)
│
└── Adminer (DB UI)

yaml
Copy code

**Ports (host → container):**
- API: `8081 → 8081`
- Adminer: `8082 → 8080`
- Postgres: `5432 → 5432`

> Inside Docker/Compose network, use **`db`** as Postgres host.  
> On your host (local run), use **`localhost`** as Postgres host.

---

## 🔧 Prerequisites

- Docker + Docker Compose
- (Optional) Go 1.23+ for local (non-Docker) runs
- `psql` / `jq` optional but handy

---

## 🔐 Environment

Create a `.env` in project root:

```env
# For Docker (Compose injects this to containers)
JWT_SECRET=change-this-to-a-long-random-string

# For local host runs (optional)
# DB_DSN=postgres://crm:crm@localhost:5432/crm?sslmode=disable
In Compose: The API uses DB_DSN=postgres://crm:crm@db:5432/crm?sslmode=disable (set inside compose).
Local run: Use localhost instead of db.

🚀 Quick Start (Prod-like, Dockerfile image)
Build + run with Compose prod profile:

bash
Copy code
docker compose --profile prod build api
docker compose --profile prod up -d api db adminer
docker compose --profile prod ps
docker compose --profile prod logs -f api
Open:

API health: http://localhost:8081/healthz

Adminer: http://localhost:8082

System: PostgreSQL

Server: db

Username: crm

Password: crm

Database: crm

Apply schema + seed (if needed)
If your DB is empty, run schema and seed against the same instance:

bash
Copy code
make db/apply
make db/seed
These use DB_DSN from .env on your host. If you prefer running inside the DB container:

bash
Copy code
docker compose exec db psql -U crm -d crm -f /docker-entrypoint-initdb.d/schema.sql
docker compose exec db psql -U crm -d crm -f /docker-entrypoint-initdb.d/seed.sql
🛠️ Dev Mode (compose-only go run)
This mounts your source code and runs go run inside the official Go image—great for fast edits.

bash
Copy code
docker compose --profile dev up -d api-dev db adminer
docker compose --profile dev logs -f api-dev
API: http://localhost:8081
Adminer: http://localhost:8082

▶️ Local Run (no Docker)
Run directly on your machine (ensure Postgres is reachable at localhost:5432):

bash
Copy code
# Load .env into the process and run
env $(grep -v '^#' .env | xargs) go run ./cmd/api
🔌 Makefile shortcuts
bash
Copy code
# Infra
make infra/up         # start db + adminer
make infra/down       # stop & remove (⚠ removes volumes)
make db/apply         # apply schema.sql (host DB_DSN)
make db/seed          # seed initial data
make psql             # psql into DB from host

# Prod-like (Dockerfile image)
make api/build
make api/up
make api/logs
make api/down

# Dev (compose-only go run)
make api-dev/up
make api-dev/logs
make api-dev/down

# Local run (no Docker)
make run-local
🔑 Auth & Roles
/auth/login → returns access_token (JWT)

Roles:

admin, coordinator, agent: can create/update/delete leads

viewer: read-only

Set Authorization: Bearer <token> for all /leads routes.

📚 Endpoints (quick)
GET /healthz — health check

POST /auth/login

POST /auth/register (admin-only in production)

POST /leads — create

GET /leads — list/filter

?q=...&country=...&status=...&from=YYYY-MM-DD&to=YYYY-MM-DD

GET /leads/:id — get one

PUT /leads/:id — update

DELETE /leads/:id — delete

Dates: use RFC3339, e.g. "2025-10-20T00:00:00Z".

🧪 cURL Smoke Test
bash
Copy code
# 1) Login
TOKEN=$(
  curl -s -X POST http://localhost:8081/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"admin@example.com","password":"admin123"}' | jq -r .access_token
)

# 2) Create
CREATE_JSON=$(curl -s -X POST http://localhost:8081/leads \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"full_name":"Aanya Student","destination_country":"Canada","status":"New","inquiry_date":"2025-10-20T00:00:00Z"}')
ID=$(printf '%s' "$CREATE_JSON" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# 3) List
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8081/leads?limit=50 | jq

# 4) Get by ID
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8081/leads/$ID | jq

# 5) Update
curl -s -X PUT http://localhost:8081/leads/$ID \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"In Progress","destination_country":"Australia","remarks":"Called back"}' | jq

# 6) Delete
curl -i -X DELETE http://localhost:8081/leads/$ID -H "Authorization: Bearer $TOKEN"
🗃️ Migrations vs AutoMigrate
Dev convenience: you may temporarily use AutoMigrate(&models.Lead{})

Production: prefer versioned SQL migrations (e.g., golang-migrate)

Enforce foreign keys, e.g.:

sql
Copy code
ALTER TABLE leads
  ADD CONSTRAINT fk_leads_branch
  FOREIGN KEY (branch_id) REFERENCES branches(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
🧰 Troubleshooting
Port in use

lsof -i :8081 / lsof -i :8082 to see which process

Change host port in docker-compose.yml if needed

invalid token

Login again (tokens expire)

Ensure same JWT_SECRET across restarts

No tables in Adminer

Confirm Adminer server = db

Apply schema/seed to the same DB instance

branch vs branch_id

Model uses branch_id (UUID FK)

Add FK constraint in DB (see above)

Optionally Preload("Branch") for names or join in SELECT

🔒 Security notes
Use a strong JWT_SECRET in .env

Don’t commit .env

In production, use a read/write DB user without schema-alter privileges

Prefer HTTPS termination in front of the API (reverse proxy or cloud LB)