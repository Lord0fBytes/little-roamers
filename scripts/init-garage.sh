#!/bin/bash
set -e

echo "======================================"
echo "Garage S3 Initialization Script"
echo "Little Roamers v0.8.0"
echo "======================================"
echo ""

# Check if .env.docker exists
if [ ! -f ".env.docker" ]; then
  echo "❌ Error: .env.docker file not found!"
  echo "Please create .env.docker from .env.docker.example first:"
  echo "  cp .env.docker.example .env.docker"
  echo "  # Then edit .env.docker and set POSTGRES_PASSWORD"
  exit 1
fi

echo "✅ Found .env.docker"
echo ""

# Step 1: Generate RPC secret and create garage.toml
echo "Step 1: Generating garage.toml configuration..."
if [ -f "garage.toml" ]; then
  echo "⚠️  garage.toml already exists. Skipping generation."
else
  RPC_SECRET=$(openssl rand -hex 32)
  cat > garage.toml <<EOF
metadata_dir = "/var/lib//garage/meta"
data_dir = "/var/lib//garage/data"
replication_factor = 1

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "127.0.0.1:3901"
rpc_secret = "$RPC_SECRET"

[s3_api]
s3_region = "garage"
api_bind_addr = "0.0.0.0:3900"
root_domain = ".s3.garage.localhost"

[s3_web]
bind_addr = "0.0.0.0:3902"
root_domain = ".web.garage.localhost"

[admin]
api_bind_addr = "0.0.0.0:3903"
EOF
  echo "✅ garage.toml created with generated RPC secret"
fi

echo ""
echo "Step 2: Starting Garage container..."
docker compose --env-file .env.docker up -d garage

echo "⏳ Waiting for Garage to be ready..."
RETRY_COUNT=0
MAX_RETRIES=30
until docker exec little-roamers-garage //garage node id -q > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ Error: Garage failed to start after 60 seconds"
    echo "Check logs with: docker logs little-roamers-garage"
    exit 1
  fi
  echo "  Attempt $RETRY_COUNT/$MAX_RETRIES..."
  sleep 2
done
echo "✅ Garage is ready!"

echo ""
echo "Step 3: Initializing Garage cluster..."
NODE_ID_FULL=$(docker exec little-roamers-garage //garage node id -q)
NODE_ID=$(echo "$NODE_ID_FULL" | cut -d'@' -f1)
echo "📌 Node ID: $NODE_ID_FULL"
echo "📌 Using Node ID (without address): $NODE_ID"

docker exec little-roamers-garage //garage layout assign -z dc1 -c 1G $NODE_ID
docker exec little-roamers-garage //garage layout apply --version 1
echo "✅ Garage cluster initialized"

echo ""
echo "Step 4: Creating access key and bucket..."
docker exec little-roamers-garage //garage key create little-roamers-app
docker exec little-roamers-garage //garage bucket create little-roamers
docker exec little-roamers-garage //garage bucket allow little-roamers --read --write --key little-roamers-app
echo "✅ Bucket and access key created"

echo ""
echo "Step 5: Retrieving credentials..."
echo "======================================"
docker exec little-roamers-garage //garage key info little-roamers-app
echo "======================================"
echo ""
echo "⚠️  IMPORTANT: Copy the credentials above to your .env.docker file:"
echo "   GARAGE_ACCESS_KEY_ID=<Key ID from above>"
echo "   GARAGE_SECRET_ACCESS_KEY=<Secret key from above>"
echo ""
echo "✅ Garage initialization complete!"
echo "Next step: Update .env.docker with credentials, then run 'docker compose up -d'"
