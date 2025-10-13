# === Makefile for Go CRM Project ===
# Usage:
#   make up           → start PostgreSQL, Redis, and Adminer
#   make down         → stop and remove containers
#   make db/apply     → apply database schema.sql
#   make db/seed      → insert initial data (branches, admin user)
#   make psql         → open Postgres shell
#   make logs         → follow container logs
#   make restart      → restart services
#   make clean        → remove all volumes (⚠️ destroys data)

SHELL := /bin/bash

ENV_FILE ?= .env
include $(ENV_FILE)
export

COMPOSE := docker compose -f docker-compose.yml

# Colors for readability
GREEN := \033[0;32m
CYAN := \033[0;36m
RESET := \033[0m

help:
	@echo "$(CYAN)Available targets:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?##"} {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}'

up: ## Start containers (db, redis, adminer)
	@echo "$(CYAN)Starting services...$(RESET)"
	$(COMPOSE) up -d

down: ## Stop containers and remove volumes
	@echo "$(CYAN)Stopping services...$(RESET)"
	$(COMPOSE) down -v

restart: ## Restart all containers
	@echo "$(CYAN)Restarting...$(RESET)"
	$(MAKE) down && $(MAKE) up

logs: ## View container logs
	$(COMPOSE) logs -f

ps: ## Show container status
	$(COMPOSE) ps

psql: ## Open Postgres shell
	@echo "$(CYAN)Connecting to database...$(RESET)"
	psql "$(DB_DSN)"

db/apply: ## Apply schema.sql to database
	@echo "$(CYAN)Applying schema.sql...$(RESET)"
	psql "$(DB_DSN)" -f schema.sql

db/seed: ## Load initial data
	@echo "$(CYAN)Seeding database...$(RESET)"
	psql "$(DB_DSN)" -f seed.sql

db/shell: ## Open an interactive SQL prompt
	@psql "$(DB_DSN)"

clean: ## Destroys all local volumes (use carefully)
	@echo "$(CYAN)Destroying local data volumes...$(RESET)"
	$(COMPOSE) down -v
	docker volume prune -f
