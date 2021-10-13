.PHONY: test

DC=docker-compose
DE=docker-compose exec -T app

# Run tests
test:
	$(DC) down
	$(DC) pull
	$(DC) up -d --force-recreate
	$(DE) sleep 5
	$(DE) yarn install
	$(DE) npm test

build:
	$(DE) npm run build

fast-test:
	$(DE) npm run lint && npm run test

install:
	$(DE) yarn install
