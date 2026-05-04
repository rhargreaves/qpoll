.PHONY: all dev api ui

all: dev

dev: api ui

api:
	@echo "Starting API server..."
	@cd api && npm run dev &

ui:
	@echo "Starting UI server..."
	@cd ui && npm run dev &
