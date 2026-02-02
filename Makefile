.PHONY: dev prod build up down logs clean migrate seed

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml up

dev-build:
	docker-compose -f docker-compose.dev.yml up --build

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod:
	docker-compose -f docker-compose.prod.yml up -d

prod-build:
	docker-compose -f docker-compose.prod.yml up --build -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Database commands
migrate:
	docker-compose -f docker-compose.dev.yml exec app npm run migration:run

migrate-prod:
	docker-compose -f docker-compose.prod.yml exec app npm run migration:run

# Clean up
clean:
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.prod.yml down -v

# Shell access
shell:
	docker-compose -f docker-compose.dev.yml exec app sh

shell-prod:
	docker-compose -f docker-compose.prod.yml exec app sh

# MySQL access
mysql:
	docker-compose -f docker-compose.dev.yml exec mysql mysql -u cms_user -p programming_club_cms