.PHONY: help setup dev build test clean db-migrate db-seed db-studio install

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '$(BLUE)Dosteon Monorepo Commands$(NC)'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

setup: ## Initial setup - install all dependencies
	@echo '$(BLUE)Setting up Dosteon...$(NC)'
	@echo '$(YELLOW)Installing dependencies...$(NC)'
	npm install --legacy-peer-deps
	@echo '$(YELLOW)Setting up backend...$(NC)'
	cd apps/backend && python3 -m venv .venv
	cd apps/backend && .venv/bin/pip install --upgrade pip
	cd apps/backend && .venv/bin/pip install -r requirements.txt
	cd apps/backend && PATH="$$PWD/.venv/bin:$$PATH" .venv/bin/python -m prisma generate
	@echo '$(GREEN)✓ Setup complete!$(NC)'

install: setup ## Alias for setup

dev: ## Start development servers (backend + frontend)
	@echo '$(BLUE)Starting development servers...$(NC)'
	@echo '$(YELLOW)Backend: http://localhost:8000$(NC)'
	@echo '$(YELLOW)Frontend: http://localhost:3000$(NC)'
	@echo ''
	@echo '$(BLUE)Press Ctrl+C to stop both servers$(NC)'
	@echo ''
	@trap 'kill 0' EXIT; \
	(cd apps/backend && .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) & \
	(cd apps/frontend && npm run dev)

dev-backend: ## Start only backend server
	@echo '$(BLUE)Starting backend server...$(NC)'
	cd apps/backend && .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start only frontend server
	@echo '$(BLUE)Starting frontend server...$(NC)'
	cd apps/frontend && npm run dev

build: ## Build all applications
	@echo '$(BLUE)Building all applications...$(NC)'
	npm run build

test: ## Run all tests
	@echo '$(BLUE)Running all tests...$(NC)'
	npm run test

test-backend: ## Run backend tests only
	@echo '$(BLUE)Running backend tests...$(NC)'
	cd apps/backend && .venv/bin/pytest

test-frontend: ## Run frontend tests only
	@echo '$(BLUE)Running frontend tests...$(NC)'
	cd apps/frontend && npm run test

lint: ## Run linters on all code
	@echo '$(BLUE)Running linters...$(NC)'
	npm run lint

clean: ## Clean build artifacts and dependencies
	@echo '$(YELLOW)Cleaning build artifacts...$(NC)'
	npm run clean
	@echo '$(GREEN)✓ Clean complete!$(NC)'

db-migrate: ## Run database migrations
	@echo '$(BLUE)Running database migrations...$(NC)'
	cd apps/backend && .venv/bin/prisma migrate dev

db-generate: ## Generate Prisma client
	@echo '$(BLUE)Generating Prisma client...$(NC)'
	cd apps/backend && PATH="$$PWD/.venv/bin:$$PATH" .venv/bin/python -m prisma generate

db-seed: ## Seed the database with sample data
	@echo '$(BLUE)Seeding database...$(NC)'
	cd apps/backend && .venv/bin/python scripts/seed/seed_data.py

db-studio: ## Open Prisma Studio
	@echo '$(BLUE)Opening Prisma Studio...$(NC)'
	cd apps/backend && .venv/bin/prisma studio

db-reset: ## Reset database (WARNING: destroys all data)
	@echo '$(YELLOW)⚠️  WARNING: This will destroy all data!$(NC)'
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd apps/backend && .venv/bin/prisma migrate reset; \
	fi

check-db: ## Check database connection and models
	@echo '$(BLUE)Checking database...$(NC)'
	cd apps/backend && .venv/bin/python scripts/db/check_db.py

check-profiles: ## Check user profiles
	@echo '$(BLUE)Checking profiles...$(NC)'
	cd apps/backend && .venv/bin/python scripts/user/check_profiles.py

verify-supabase: ## Verify Supabase connection and setup
	@echo '$(BLUE)Verifying Supabase setup...$(NC)'
	cd apps/backend && .venv/bin/python scripts/maintenance/verify_supabase_setup.py

status: ## Show git status
	@git status

logs-backend: ## Show backend logs (if running in background)
	@tail -f apps/backend/logs/*.log 2>/dev/null || echo "No logs found"

docker-up: ## Start Docker services
	@echo '$(BLUE)Starting Docker services...$(NC)'
	docker-compose -f infra/observability/docker-compose.observability.yml up -d

docker-down: ## Stop Docker services
	@echo '$(BLUE)Stopping Docker services...$(NC)'
	docker-compose -f infra/observability/docker-compose.observability.yml down

.DEFAULT_GOAL := help
