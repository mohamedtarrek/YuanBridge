.PHONY: build dev seed deploy

build:
	docker-compose build

dev:
	docker-compose up

seed:
	npx prisma db push
	npx tsx src/lib/db/seed.ts

deploy:
	git push origin main
