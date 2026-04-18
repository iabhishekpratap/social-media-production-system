#!/bin/bash

COMPOSE_FILES="-f docker-compose.migrate.yml"

docker compose $COMPOSE_FILES run --rm users_service_migrate

set -e  # stop on error

echo "=============================="
echo "Starting Database Migrations"
echo "=============================="

echo "Running Users Service migrations..."
docker compose $COMPOSE_FILES run --rm users_service_migrate

echo "Running Video Service migrations..."
docker compose $COMPOSE_FILES run --rm video_service_migrate

echo "Running Analytics Service migrations..."
docker compose $COMPOSE_FILES run --rm analytics_service_migrate

echo "=============================="
echo "All migrations completed successfully!"
echo "=============================="