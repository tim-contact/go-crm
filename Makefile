SHELL := /bin/bash
ENV_FILE ?= .env
include $(ENV_FILE)
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
	psql "$(DB_DSN)"

db/apply:
	psql "$(DB_DSN)" -f schema.sql

db/seed:
	psql "$(DB_DSN)" -f seed.sql

clean:
	$(COMPOSE) down -v
	docker volume prune -f

# === Local run (no Docker), loads .env ===
run-local:
	@env $$(grep -v '^#' .env | xargs) go run ./cmd/api

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
