Docker Compose Setup

  1. Create a directory structure:
  mkdir -p ~/little-roamers-storage/data
  mkdir -p ~/little-roamers-storage/meta
  cd ~/little-roamers-storage

  2. Create docker-compose.yml:
  version: "3.8"

  services:
    garage:
      image: dxflrs/garage:v1.0.1
      container_name: garage-little-roamers
      restart: unless-stopped
      network_mode: "host"
      volumes:
        - ./data:/var/lib/garage/data
        - ./meta:/var/lib/garage/meta
        - ./garage.toml:/etc/garage.toml
      environment:
        - RUST_LOG=garage=info

  3. Create garage.toml:
  metadata_dir = "/var/lib/garage/meta"
  data_dir = "/var/lib/garage/data"

  # Single node setup
  replication_factor = 1

  rpc_bind_addr = "[::]:3901"
  rpc_public_addr = "127.0.0.1:3901"
  # Generate a random secret: openssl rand -hex 32
  rpc_secret = "1799bccfd7411afa8a3c1c4a54e6e6f85f0e5d8fc1f9f6f6e8b7c5e5f6e8f9a0"

  [s3_api]
  s3_region = "garage"
  api_bind_addr = "0.0.0.0:3900"
  root_domain = ".s3.garage.localhost"

  [s3_web]
  bind_addr = "0.0.0.0:3902"
  root_domain = ".web.garage.localhost"

  [admin]
  api_bind_addr = "0.0.0.0:3903"

  Note: Generate a unique rpc_secret by running: openssl rand -hex 32 and replace the value above.

  ---
  Commands to Run

  4. Start the container:
  docker compose up -d

  5. Wait a few seconds, then check it's running:
  docker compose logs

  6. Initialize the Garage cluster:
  # Get the node ID
  docker exec garage-little-roamers garage node id

  # Assign the node to layout (creates a cluster)
  NODE_ID=$(docker exec garage-little-roamers garage node id -q)
  docker exec garage-little-roamers garage layout assign -z dc1 -c 1 $NODE_ID

  # Apply the layout
  docker exec garage-little-roamers garage layout apply --version 1

  7. Create access key and bucket:
  # Create key for Little Roamers app
  docker exec garage-little-roamers garage key create little-roamers-key

  # Create bucket
  docker exec garage-little-roamers garage bucket create little-roamers

  # Allow the key to access the bucket with read/write permissions
  docker exec garage-little-roamers garage bucket allow little-roamers --read --write --key little-roamers-key

  8. Get your credentials (SAVE THESE!):
  docker exec garage-little-roamers garage key info little-roamers-key

  This will output something like:
  Key name: little-roamers-key
  Key ID: GK1234567890abcdef
  Secret key: 1234567890abcdef1234567890abcdef1234567890abcdef
  Authorized buckets:
  - little-roamers

  ---
  What to Send Back

  Once you've run all these commands, send me:
  1. ✅ Access Key ID (the "Key ID" from step 8)
  2. ✅ Secret Access Key (the "Secret key" from step 8)
  3. ✅ Confirmation that the bucket "little-roamers" was created successfully

  Then I'll update your .env.local file and install the necessary npm packages!

  ---
  Troubleshooting

  If something goes wrong:
  # Check container status
  docker compose ps

  # View logs
  docker compose logs -f

  # Restart container
  docker compose restart

  # Check if port 3900 is accessible
  curl http://10.0.0.18:3900
  # Should return an XML error (that's expected - means S3 API is working)

  Let me know when you have the credentials ready! 🚀