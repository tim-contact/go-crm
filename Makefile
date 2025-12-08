SHELL := /bin/bash
BACKEND_ENV ?= backend/.env
FRONTEND_ENV ?= crm-frontend/.env

# Include both env files
-include $(BACKEND_ENV)
-include $(FRONTEND_ENV)
export


COMPOSE := docker compose -f docker-compose.yml

# Infra (db, adminer, redis if any)
infra/up:
	$(COMPOSE) up -d db adminer

infra/down:
	$(COMPOSE) down -v

infra/logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

psql:
	docker exec -it $$(docker ps -qf "name=db") psql -U crm -d crm

db/apply:
	docker exec -i $$(docker ps -qf "name=db") psql -U crm -d crm < backend/schema.sql

db/migrate:
	docker exec -i $$(docker ps -qf "name=db") psql -U crm -d crm < backend/migrations/convert_uuid_to_nanoid.sql

db/seed:
	docker exec -i $$(docker ps -qf "name=db") psql -U crm -d crm < backend/seed.sql

clean:
	$(COMPOSE) down -v
	docker volume prune -f

# === Local run (no Docker), loads .env ===
run-local:
	cd backend && env $$(grep -v '^#' .env | xargs) go run ./cmd/api


env/print:
	@echo "DB_DSN=$(DB_DSN)"
	@echo "JWT_SECRET=$(JWT_SECRET)"

# Full local dev (infra in Docker, apps local)

dev-local:
	@echo "Starting local development environment..."
	@$(MAKE) infra/up
	@echo "Waiting for database..."
	@sleep 3
	@$(MAKE) db/apply
	@echo ""
	@echo "✓ Infrastructure ready!"
	@echo ""
	@echo "Run in separate terminals:"
	@echo "  1. make run-local          (backend)"
	@echo "  2. make run-frontend-local (frontend)"

env/print:
	@echo "DB_DSN=$(DB_DSN)"
	@echo "JWT_SECRET=$(JWT_SECRET)"

# === Docker (prod-like, Dockerfile) ===
api/build:
	$(COMPOSE) --profile prod build api

api/up:
	$(COMPOSE) --profile prod up -d api db adminer

api/logs:
	$(COMPOSE) --profile prod logs -f api

api/down:
	$(COMPOSE) --profile prod down

# === Docker (dev, compose-only go run) ===
api-dev/up:
	$(COMPOSE) --profile dev up -d api-dev db adminer

api-dev/logs:
	$(COMPOSE) --profile dev logs -f api-dev

api-dev/down:
	$(COMPOSE) --profile dev down

# === Frontend build ===


frontend/build:
	$(COMPOSE) --profile prod build frontend

frontend/up:
	$(COMPOSE) --profile prod up -d frontend

frontend/logs:
	$(COMPOSE) --profile prod logs -f frontend

frontend/down:
	$(COMPOSE) --profile prod down