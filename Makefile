.PHONY: all dev api ui

all: dev

dev:
	@echo "Starting all servers..."
	@npm run dev

api:
	@echo "Starting API server..."
	@npm run start:api

ui:
	@echo "Starting UI server..."
	@npm run start:ui
