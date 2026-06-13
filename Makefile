# Makefile — raccourcis pour le manifeste AI-Driven Development.
# L'app Astro vit dans app/ : ces cibles gèrent le `cd app` pour toi.

APP := app
PORT ?= 5555
HOST ?= 127.0.0.1

.DEFAULT_GOAL := help

.PHONY: help install dev build serve preview test test-watch test-e2e test-checklist \
        docker-up docker-down docker-logs clean

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Installe les dépendances (npm install)
	cd $(APP) && npm install

$(APP)/node_modules: $(APP)/package.json
	cd $(APP) && npm install

dev: $(APP)/node_modules ## Installe si besoin puis lance le dev avec HMR (http://localhost:5555)
	cd $(APP) && npm run dev -- --port $(PORT) --host $(HOST)

build: ## Build de production
	cd $(APP) && npm run build

serve: build ## Build puis sert la version de production
	cd $(APP) && PORT=$(PORT) HOST=$(HOST) node ./dist/server/entry.mjs

preview: ## Prévisualise le build (astro preview)
	cd $(APP) && npm run preview

test: ## Tests unitaires Vitest
	cd $(APP) && npm test

test-watch: ## Tests unitaires en watch
	cd $(APP) && npm run test:watch

test-e2e: ## Tests end-to-end Playwright
	cd $(APP) && npm run test:e2e

test-checklist: ## Test e2e checklist uniquement
	cd $(APP) && npm run test:checklist

docker-up: ## Démarre la stack Docker (build + détaché)
	cd $(APP) && docker compose up -d --build

docker-down: ## Arrête la stack Docker
	cd $(APP) && docker compose down

docker-logs: ## Suit les logs Docker
	cd $(APP) && docker compose logs -f

clean: ## Supprime le build et node_modules
	cd $(APP) && rm -rf dist node_modules
