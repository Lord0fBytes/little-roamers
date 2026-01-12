# Little Roamers - Docker Deployment Guide

**Version 0.8.0** - Complete containerized deployment for Little Roamers activity tracker

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Configuration Reference](#configuration-reference)
6. [Operations](#operations)
7. [Backup & Restore](#backup--restore)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Topics](#advanced-topics)

---

## Introduction

This deployment guide helps you run Little Roamers as a fully containerized stack using Docker Compose. This is a **boring, production-grade setup** with:

- **Next.js Application** (built from source) - The web application (port 3000)
- **PostgreSQL 16** (official image) - Database for activity storage (port 5432)
- **Garage S3** (official image) - Self-hosted object storage for images (ports 3900, 3902)

**Design Philosophy**: Pin versions, use official images, keep it simple. Migrations run from the app container (production best practice).

### Architecture

```
┌─────────────────────────────────────────┐
│         Docker Network (bridge)         │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │   app    │  │ postgres │  │ garage│ │
│  │ :3000    │  │  :5432   │  │ :3900 │ │
│  └────┬─────┘  └────┬─────┘  └───┬───┘ │
│       │             │             │     │
│       └─────────────┴─────────────┘     │
└─────────────────────────────────────────┘
         │             │             │
    localhost:3000  localhost:5432  localhost:3900
```

### Benefits

- **Isolated Environment** - All dependencies containerized
- **Data Persistence** - Volumes ensure data survives container restarts
- **Easy Deployment** - Single command to start entire stack
- **Reproducible** - Same environment on any machine with Docker

---

## Quick Start

**For experienced Docker users** - complete deployment in 5 minutes:

```bash
# 1. Setup environment
cp .env.docker.example .env.docker
# Edit .env.docker: Set POSTGRES_PASSWORD (use: openssl rand -base64 32)

# 2. Initialize Garage
chmod +x scripts/init-garage.sh
./scripts/init-garage.sh
# Copy credentials from output to .env.docker

# 3. Start stack
docker compose --env-file .env.docker up -d

# 4. Verify health
docker compose ps
# All services should show "healthy" status

# 5. Access application
open http://localhost:3000
```

**Note**: The `--env-file .env.docker` flag tells Docker Compose to read environment variables from `.env.docker` instead of the default `.env` file.

---

## Prerequisites

### Required Software

1. **Docker Desktop** (v20.10+)
   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. **Docker Compose** (v2.0+)
   - Included with Docker Desktop
   - Linux standalone: https://docs.docker.com/compose/install/

3. **OpenSSL** (for password generation)
   - Pre-installed on macOS/Linux
   - Windows: Included with Git Bash

### System Requirements

- **RAM**: Minimum 4GB available
- **Disk Space**: Minimum 10GB free
- **Ports**: 3000, 5432, 3900 must be available

### Verify Installation

```bash
docker --version
# Should show: Docker version 20.10.0 or higher

docker compose version
# Should show: Docker Compose version v2.0.0 or higher
```

---

## Step-by-Step Setup

### Step 1: Clone Repository

```bash
cd ~/Documents/Coding
git clone <repository-url> little-roamers
cd little-roamers
```

### Step 2: Create Environment File

Copy the environment template:

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` and set a strong PostgreSQL password:

```bash
# Generate a strong password
openssl rand -base64 32

# Edit .env.docker
nano .env.docker  # or use your preferred editor
```

Set `POSTGRES_PASSWORD` to the generated password:

```bash
POSTGRES_PASSWORD=<your-generated-password>
```

**⚠️ Important**: Do NOT commit `.env.docker` to git (already in `.gitignore`)

### Step 3: Initialize Garage S3

Make the initialization script executable:

```bash
chmod +x scripts/init-garage.sh
```

Run the Garage initialization:

```bash
./scripts/init-garage.sh
```

**Expected Output**:

```
======================================
Garage S3 Initialization Script
Little Roamers v0.8.0
======================================

Step 1: Generating garage.toml configuration...
✅ garage.toml created with generated RPC secret

Step 2: Starting Garage container...
⏳ Waiting 10 seconds for Garage to initialize...

Step 3: Initializing Garage cluster...
📌 Node ID: <node-id>
✅ Garage cluster initialized

Step 4: Creating access key and bucket...
✅ Bucket and access key created

Step 5: Retrieving credentials...
======================================
Key ID: GK<key-id>
Secret key: <secret-key>
======================================

⚠️  IMPORTANT: Copy the credentials above to your .env.docker file:
   GARAGE_ACCESS_KEY_ID=<Key ID from above>
   GARAGE_SECRET_ACCESS_KEY=<Secret key from above>

✅ Garage initialization complete!
Next step: Update .env.docker with credentials, then run 'docker compose up -d'
```

**Action Required**: Copy the `GARAGE_ACCESS_KEY_ID` and `GARAGE_SECRET_ACCESS_KEY` from the output to your `.env.docker` file.

### Step 4: Start the Full Stack

Start all services:

```bash
docker compose up -d
```

**Expected Output**:

```
[+] Running 4/4
 ✔ Network little-roamers-network  Created
 ✔ Container little-roamers-postgres  Started
 ✔ Container little-roamers-garage    Started
 ✔ Container little-roamers-app       Started
```

### Step 5: Verify Deployment

Check container status:

```bash
docker compose ps
```

**Expected Output** (after ~40 seconds):

```
NAME                       STATUS              PORTS
little-roamers-app         Up (healthy)        0.0.0.0:3000->3000/tcp
little-roamers-garage      Up (healthy)        0.0.0.0:3900->3900/tcp, 0.0.0.0:3902->3902/tcp
little-roamers-postgres    Up (healthy)        0.0.0.0:5432->5432/tcp
```

All services should show **(healthy)** status.

Run the health check script:

```bash
./scripts/health-check.sh
```

### Step 6: Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the Little Roamers feed page (empty state initially).

**Congratulations!** Your deployment is complete. You can now start logging activities.

---

## Configuration Reference

### Environment Variables (.env.docker)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_DB` | PostgreSQL database name | `little_roamers` | Yes |
| `POSTGRES_USER` | PostgreSQL username | `postgres` | Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password | - | **Yes** |
| `GARAGE_REGION` | Garage S3 region | `garage` | Yes |
| `GARAGE_ACCESS_KEY_ID` | Garage access key | - | **Yes** |
| `GARAGE_SECRET_ACCESS_KEY` | Garage secret key | - | **Yes** |
| `GARAGE_BUCKET` | Garage bucket name | `little-roamers` | Yes |

### Garage Configuration (garage.toml)

Generated automatically by `scripts/init-garage.sh`. Key settings:

```toml
metadata_dir = "/var/lib/garage/meta"  # Garage metadata storage
data_dir = "/var/lib/garage/data"      # Garage object storage
replication_factor = 1                  # Single-node deployment

[s3_api]
s3_region = "garage"                    # S3 API region
api_bind_addr = "0.0.0.0:3900"         # S3 API port

[admin]
api_bind_addr = "0.0.0.0:3903"         # Admin API port
```

**⚠️ Do NOT** manually edit `garage.toml` after initialization.

### Docker Compose Services

#### PostgreSQL Service

- **Image**: `postgres:16` (official, pinned major version)
- **Port**: 5432 (exposed to localhost)
- **Volume**: `little-roamers-postgres-data`
- **Migrations**: Run from app container (production best practice)

#### Garage Service

- **Image**: `dxflrs/garage:v1.0.1`
- **Ports**: 3900 (S3 API), 3902 (Web UI)
- **Volumes**: `little-roamers-garage-data`, `little-roamers-garage-meta`

#### App Service

- **Build**: Multi-stage Dockerfile (Node.js 20 Alpine)
- **Port**: 3000 (web interface)
- **Depends on**: PostgreSQL (healthy), Garage (healthy)

---

## Operations

### Database Migrations

**Automatic**: Migrations run automatically when the app container starts.

The app container:
1. Waits for PostgreSQL to be ready
2. Checks if the `activities` table exists
3. If not, applies `schema.sql`
4. Starts the Next.js application

**Manual migration** (if needed):

```bash
docker compose exec app ./run-migrations.sh
```

**Check migration status**:

```bash
./scripts/verify-db.sh
```

### Starting Services

Start all services in detached mode:

```bash
docker compose --env-file .env.docker up -d
```

Start specific service:

```bash
docker compose --env-file .env.docker up -d postgres
docker compose --env-file .env.docker up -d garage
docker compose --env-file .env.docker up -d app
```

### Stopping Services

Stop all services:

```bash
docker compose down
```

**Note**: Data persists in volumes (NOT deleted)

Stop and remove volumes (⚠️ **deletes all data**):

```bash
docker compose down -v
```

### Viewing Logs

View logs for all services:

```bash
docker compose logs -f
```

View logs for specific service:

```bash
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f garage
```

View last 100 lines:

```bash
docker compose logs --tail=100 app
```

### Restarting Services

Restart all services:

```bash
docker compose restart
```

Restart specific service:

```bash
docker compose restart app
```

### Rebuilding Application

If you make code changes, rebuild the app:

```bash
docker compose build app
docker compose up -d app
```

### Health Monitoring

Use the health check script:

```bash
./scripts/health-check.sh
```

Manual health checks:

```bash
# PostgreSQL
docker exec little-roamers-postgres pg_isready -U postgres

# Garage
curl -s http://localhost:3900

# Application
curl -s http://localhost:3000/api/activities
```

---

## Backup & Restore

### Database Backup

Create a PostgreSQL dump:

```bash
./scripts/backup-db.sh
```

Output: `backups/little-roamers-db-<timestamp>.sql`

### Volume Backup

Backup all Docker volumes:

```bash
./scripts/backup-volumes.sh
```

Output (in `backups/` directory):
- `postgres-<timestamp>.tar.gz` - PostgreSQL data
- `garage-data-<timestamp>.tar.gz` - Garage object storage
- `garage-meta-<timestamp>.tar.gz` - Garage metadata

### Manual Backup

Database only:

```bash
docker exec little-roamers-postgres pg_dump -U postgres little_roamers > backup.sql
```

### Restore from Backup

#### Restore Database

1. Stop the application:

```bash
docker compose down
```

2. Start PostgreSQL only:

```bash
docker compose up -d postgres
```

3. Wait for PostgreSQL to be ready:

```bash
docker exec little-roamers-postgres pg_isready -U postgres
```

4. Restore from backup:

```bash
docker exec -i little-roamers-postgres psql -U postgres little_roamers < backups/little-roamers-db-<timestamp>.sql
```

5. Start all services:

```bash
docker compose up -d
```

#### Restore Volumes

**⚠️ This deletes current data**

1. Stop and remove volumes:

```bash
docker compose down -v
```

2. Recreate volumes and restore:

```bash
# PostgreSQL
docker volume create little-roamers-postgres-data
docker run --rm -v little-roamers-postgres-data:/data -v $(pwd)/backups:/backup alpine tar xzf /backup/postgres-<timestamp>.tar.gz -C /

# Garage data
docker volume create little-roamers-garage-data
docker run --rm -v little-roamers-garage-data:/data -v $(pwd)/backups:/backup alpine tar xzf /backup/garage-data-<timestamp>.tar.gz -C /

# Garage metadata
docker volume create little-roamers-garage-meta
docker run --rm -v little-roamers-garage-meta:/data -v $(pwd)/backups:/backup alpine tar xzf /backup/garage-meta-<timestamp>.tar.gz -C /
```

3. Start services:

```bash
docker compose up -d
```

---

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill

# Or for Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### PostgreSQL Unhealthy

**Symptoms**: `docker compose ps` shows postgres as unhealthy

**Diagnosis**:

```bash
docker compose logs postgres
```

**Common Causes**:

1. **Wrong password in .env.docker**
   - Fix: Update `POSTGRES_PASSWORD` in `.env.docker`
   - Restart: `docker compose restart postgres`

2. **Corrupted data volume**
   - Fix: Remove volume and recreate
   ```bash
   docker compose down -v
   docker compose up -d
   ```

### Garage Connection Errors

**Symptoms**: App logs show "Failed to upload image" or S3 errors

**Diagnosis**:

```bash
docker compose logs garage
```

**Common Causes**:

1. **Missing credentials in .env.docker**
   - Fix: Re-run `./scripts/init-garage.sh`
   - Copy credentials to `.env.docker`
   - Restart app: `docker compose restart app`

2. **Garage not initialized**
   - Fix: Run initialization script
   ```bash
   ./scripts/init-garage.sh
   ```

### App Can't Connect to Database

**Symptoms**: App logs show "connection refused" or "database error"

**Diagnosis**:

```bash
docker compose logs app | grep -i error
```

**Solution**:

1. Verify PostgreSQL is healthy:
   ```bash
   docker compose ps postgres
   ```

2. Check DATABASE_URL format in app logs

3. Verify `.env.docker` has correct `POSTGRES_PASSWORD`

4. Restart app:
   ```bash
   docker compose restart app
   ```

### Build Fails (Sharp/HEIC Issues)

**Error**: `Could not load the "sharp" module` or HEIC errors during build

**Solution 1** - Rebuild with no cache:

```bash
docker compose build --no-cache app
docker compose up -d app
```

**Solution 2** - Switch to Debian base (if Alpine issues persist):

Edit `Dockerfile`, change all `node:20-alpine` to `node:20-slim`

### Health Check Timeouts

**Symptoms**: Container shows "starting" for >2 minutes

**Diagnosis**:

```bash
# Check logs for specific service
docker compose logs <service-name>

# Check resource usage
docker stats
```

**Solutions**:

1. Increase Docker Desktop memory allocation (Preferences → Resources)
2. Increase `start_period` in `docker-compose.yml` healthcheck
3. Check system resources (CPU, RAM)

### Data Not Persisting

**Symptoms**: Data disappears after `docker compose down`

**Diagnosis**:

```bash
docker volume ls | grep little-roamers
```

**Expected Output**:
```
little-roamers-garage-data
little-roamers-garage-meta
little-roamers-postgres-data
```

**Solution**: Ensure you're NOT using `docker compose down -v` (which deletes volumes)

---

## Advanced Topics

### Production Deployment

For production environments, consider:

1. **Use Docker Secrets** instead of `.env.docker`:

```yaml
secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
  garage_secret:
    file: ./secrets/garage_secret.txt

services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
```

2. **Enable SSL/TLS** for PostgreSQL and reverse proxy for app

3. **Configure automated backups** with cron jobs

4. **Set up monitoring** (Prometheus + Grafana)

5. **Use external volumes** for better backup control

### Custom Network Configuration

To use a specific subnet or IP range:

```yaml
networks:
  little-roamers-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
          gateway: 172.28.0.1
```

### Scaling Considerations

**Current Setup**: Single-node deployment (not horizontally scalable)

**For scaling**:
- PostgreSQL: Use managed service (RDS, DigitalOcean DB)
- Garage: Configure multi-node replication
- App: Add load balancer, multiple app containers

### Development vs Production

Create separate compose files:

- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development overrides
- `docker-compose.prod.yml` - Production overrides

Use:

```bash
# Development
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Accessing PostgreSQL Directly

Connect with psql:

```bash
docker exec -it little-roamers-postgres psql -U postgres -d little_roamers
```

Connect with GUI tool (TablePlus, DBeaver, pgAdmin):

- **Host**: localhost
- **Port**: 5432
- **Database**: little_roamers
- **Username**: postgres
- **Password**: <from .env.docker>

### Accessing Garage Admin

Garage provides an admin API on port 3903 (internal only).

To use garage CLI:

```bash
docker exec -it little-roamers-garage garage <command>
```

Common commands:

```bash
# List buckets
docker exec little-roamers-garage garage bucket list

# List keys
docker exec little-roamers-garage garage key list

# Node status
docker exec little-roamers-garage garage node id
```

---

## Support

For issues, questions, or feature requests:

- **GitHub Issues**: https://github.com/<your-org>/little-roamers/issues
- **Documentation**: See CLAUDE.md for project details
- **Logs**: Always include `docker compose logs` output when reporting issues

---

## Version History

**v0.8.0** (2026-01-11)
- Initial Docker deployment support
- 3-service stack (app, postgres, garage)
- Automated initialization scripts
- Backup/restore utilities
- Comprehensive documentation
