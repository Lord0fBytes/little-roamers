#!/bin/bash

echo "Little Roamers Health Status"
echo "======================================"
docker compose --env-file .env.docker ps
echo ""
echo "Detailed Health Checks:"
echo "----------------------"
echo "PostgreSQL:"
docker exec little-roamers-postgres pg_isready -U postgres || echo "❌ PostgreSQL unhealthy"
echo ""
echo "Garage S3:"
curl -s http://localhost:3900 > /dev/null && echo "✅ Garage healthy" || echo "❌ Garage unhealthy"
echo ""
echo "Application:"
curl -s http://localhost:3000/api/activities > /dev/null && echo "✅ Application healthy" || echo "❌ Application unhealthy"
