# Little Roamers v0.8.0 - Docker Deployment Implementation Plan

**Issue**: GitHub #9 - Version 0.8.0 - Docker Deployment
**Scope**: Containerize entire stack (Next.js app, PostgreSQL, Garage S3) with comprehensive testing

---

## Overview

Transform Little Roamers from development mode (external PostgreSQL/Garage) to fully containerized deployment using Docker Compose. This enables easy deployment, data persistence, and reproducible environments.

### Current State
- Next.js 15 app running in development mode
- PostgreSQL database at 10.0.0.18:5432 (external)
- Garage S3 storage at 10.0.0.18:3900 (external)
- No containerization

### Target State
- 3-container Docker Compose stack:
  - **app**: Next.js application (port 3000)
  - **postgres**: PostgreSQL 16 database (port 5432)
  - **garage**: Garage S3 storage (ports 3900, 3902)
- Persistent volumes for data
- Automated initialization
- Health checks and dependency management
- Comprehensive documentation

---

## Architecture

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

**Internal Communication**: Services use Docker DNS (postgres, garage, app)
**External Access**: All ports exposed to localhost for operations/debugging

---

## Implementation Sequence

### Phase 1: Core Infrastructure Files

#### 1. Create `.dockerignore`
Excludes unnecessary files from Docker build context for faster builds.

**Content**:
```
.git
.github
.next
.env.local
.env*.local
node_modules
npm-debug.log
README.md
CLAUDE.md
SETUP*.md
*.test.ts
*.test.tsx
.vscode
.idea
.DS_Store
Dockerfile
docker-compose.yml
.dockerignore
screenshots
coverage
```

#### 2. Create `Dockerfile`
Multi-stage build for optimized Next.js production image.

**Strategy**:
- **Stage 1 (deps)**: Install production dependencies
- **Stage 2 (builder)**: Build Next.js application
- **Stage 3 (runner)**: Minimal runtime image

**Key Features**:
- Node.js 20 Alpine (minimal size)
- Non-root user (nextjs:1001) for security
- Layer caching optimization
- `libc6-compat` for Sharp/heic-convert native modules

**Content**:
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Important**: Requires Next.js standalone build. Update `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'garage',
        port: '3900',
        pathname: '/little-roamers/**',
      },
    ],
  },
};
```

#### 3. Create `.env.docker.example`
Template for environment variables with clear instructions.

**Content**:
```bash
# Little Roamers Docker Environment Configuration
# Copy this to .env.docker and fill in the values

# ====================
# PostgreSQL Database
# ====================
POSTGRES_DB=little_roamers
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# ====================
# Garage S3 Storage
# ====================
# After running scripts/init-garage.sh, copy credentials here:
GARAGE_REGION=garage
GARAGE_ACCESS_KEY_ID=REPLACE_AFTER_GARAGE_INIT
GARAGE_SECRET_ACCESS_KEY=REPLACE_AFTER_GARAGE_INIT
GARAGE_BUCKET=little-roamers

# ====================
# Notes
# ====================
# - POSTGRES_PASSWORD: Use a strong password (20+ characters)
#   Generate with: openssl rand -base64 32
# - GARAGE credentials: Generated by scripts/init-garage.sh
# - Do NOT commit .env.docker to git (already in .gitignore)
```

#### 4. Create `docker-compose.yml`
Orchestrates 3-service stack with health checks and dependencies.

**Content**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: little-roamers-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-little_roamers}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
    ports:
      - "5432:5432"
    networks:
      - little-roamers-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  garage:
    image: dxflrs/garage:v1.0.1
    container_name: little-roamers-garage
    restart: unless-stopped
    environment:
      RUST_LOG: garage=info
    volumes:
      - garage-data:/var/lib/garage/data
      - garage-meta:/var/lib/garage/meta
      - ./garage.toml:/etc/garage.toml:ro
    ports:
      - "3900:3900"
      - "3902:3902"
    networks:
      - little-roamers-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3900 || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 3

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: little-roamers-app
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-little_roamers}
      GARAGE_ENDPOINT: http://garage:3900
      GARAGE_REGION: ${GARAGE_REGION:-garage}
      GARAGE_ACCESS_KEY_ID: ${GARAGE_ACCESS_KEY_ID}
      GARAGE_SECRET_ACCESS_KEY: ${GARAGE_SECRET_ACCESS_KEY}
      GARAGE_BUCKET: ${GARAGE_BUCKET:-little-roamers}
      NODE_ENV: production
    ports:
      - "3000:3000"
    networks:
      - little-roamers-network
    depends_on:
      postgres:
        condition: service_healthy
      garage:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/api/activities || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres-data:
    name: little-roamers-postgres-data
  garage-data:
    name: little-roamers-garage-data
  garage-meta:
    name: little-roamers-garage-meta

networks:
  little-roamers-network:
    name: little-roamers-network
    driver: bridge
```

**Key Features**:
- PostgreSQL auto-initializes schema on first run (`/docker-entrypoint-initdb.d/`)
- Health checks prevent app from starting before dependencies ready
- Named volumes for data persistence
- Internal network for service communication
- All ports exposed for operations/debugging

---

### Phase 2: Initialization Scripts

#### 5. Create `scripts/init-garage.sh`
Automated Garage initialization with credential generation.

**Purpose**: Generates `garage.toml`, initializes Garage cluster, creates bucket and access keys.

**Content**:
```bash
#!/bin/bash
set -e

echo "======================================"
echo "Garage S3 Initialization Script"
echo "Little Roamers v0.8.0"
echo "======================================"
echo ""

# Step 1: Generate RPC secret and create garage.toml
echo "Step 1: Generating garage.toml configuration..."
if [ -f "garage.toml" ]; then
  echo "⚠️  garage.toml already exists. Skipping generation."
else
  RPC_SECRET=$(openssl rand -hex 32)
  cat > garage.toml <<EOF
metadata_dir = "/var/lib/garage/meta"
data_dir = "/var/lib/garage/data"
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
docker compose up -d garage
echo "⏳ Waiting 10 seconds for Garage to initialize..."
sleep 10

echo ""
echo "Step 3: Initializing Garage cluster..."
NODE_ID=$(docker exec little-roamers-garage garage node id -q)
echo "📌 Node ID: $NODE_ID"

docker exec little-roamers-garage garage layout assign -z dc1 -c 1 $NODE_ID
docker exec little-roamers-garage garage layout apply --version 1
echo "✅ Garage cluster initialized"

echo ""
echo "Step 4: Creating access key and bucket..."
docker exec little-roamers-garage garage key create little-roamers-app
docker exec little-roamers-garage garage bucket create little-roamers
docker exec little-roamers-garage garage bucket allow little-roamers --read --write --key little-roamers-app
echo "✅ Bucket and access key created"

echo ""
echo "Step 5: Retrieving credentials..."
echo "======================================"
docker exec little-roamers-garage garage key info little-roamers-app
echo "======================================"
echo ""
echo "⚠️  IMPORTANT: Copy the credentials above to your .env.docker file:"
echo "   GARAGE_ACCESS_KEY_ID=<Key ID from above>"
echo "   GARAGE_SECRET_ACCESS_KEY=<Secret key from above>"
echo ""
echo "✅ Garage initialization complete!"
echo "Next step: Update .env.docker with credentials, then run 'docker compose up -d'"
```

**Make executable**: `chmod +x scripts/init-garage.sh`

#### 6. Create `scripts/verify-db.sh`
Verifies database schema is correctly initialized.

**Content**:
```bash
#!/bin/bash
set -e

echo "Verifying PostgreSQL database schema..."

docker exec little-roamers-postgres psql -U postgres -d little_roamers -c "
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'activities'
ORDER BY ordinal_position;
"

echo ""
echo "Verifying triggers..."
docker exec little-roamers-postgres psql -U postgres -d little_roamers -c "
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'activities';
"

echo ""
echo "Activity count:"
docker exec little-roamers-postgres psql -U postgres -d little_roamers -c "
SELECT COUNT(*) as activity_count FROM activities;
"

echo "✅ Database verification complete"
```

**Make executable**: `chmod +x scripts/verify-db.sh`

---

### Phase 3: Operations Scripts

#### 7. Create `scripts/health-check.sh`
Monitor container health status.

**Content**:
```bash
#!/bin/bash

echo "Little Roamers Health Status"
echo "======================================"
docker compose ps
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
```

**Make executable**: `chmod +x scripts/health-check.sh`

#### 8. Create `scripts/backup-db.sh`
Database backup utility.

**Content**:
```bash
#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/little-roamers-db-$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "Creating PostgreSQL backup..."
docker exec little-roamers-postgres pg_dump -U postgres little_roamers > "$BACKUP_FILE"

echo "✅ Database backup created: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
```

**Make executable**: `chmod +x scripts/backup-db.sh`

#### 9. Create `scripts/backup-volumes.sh`
Volume backup utility for PostgreSQL and Garage data.

**Content**:
```bash
#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Backing up PostgreSQL volume..."
docker run --rm \
  -v little-roamers-postgres-data:/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf "/backup/postgres-$TIMESTAMP.tar.gz" /data
echo "✅ PostgreSQL volume: $BACKUP_DIR/postgres-$TIMESTAMP.tar.gz"

echo "Backing up Garage data volume..."
docker run --rm \
  -v little-roamers-garage-data:/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf "/backup/garage-data-$TIMESTAMP.tar.gz" /data
echo "✅ Garage data volume: $BACKUP_DIR/garage-data-$TIMESTAMP.tar.gz"

echo "Backing up Garage metadata volume..."
docker run --rm \
  -v little-roamers-garage-meta:/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf "/backup/garage-meta-$TIMESTAMP.tar.gz" /data
echo "✅ Garage metadata volume: $BACKUP_DIR/garage-meta-$TIMESTAMP.tar.gz"

echo ""
echo "✅ All volume backups complete in $BACKUP_DIR/"
```

**Make executable**: `chmod +x scripts/backup-volumes.sh`

---

### Phase 4: Documentation

#### 10. Create `DEPLOY.md`
Comprehensive deployment guide.

**Structure**:
1. **Introduction** - What this deployment provides, architecture diagram, requirements
2. **Quick Start** - 5-minute setup for experienced users
3. **Step-by-Step Setup** - Detailed instructions for new users
4. **Configuration Reference** - Environment variables and config files explained
5. **Operations** - Starting/stopping, logs, health monitoring, backups
6. **Troubleshooting** - Common errors and solutions
7. **Advanced Topics** - Production hardening, security, scaling

**Key Sections**:

**Quick Start**:
```bash
# 1. Setup environment
cp .env.docker.example .env.docker
# Edit .env.docker: Set POSTGRES_PASSWORD

# 2. Initialize Garage
chmod +x scripts/init-garage.sh
./scripts/init-garage.sh
# Copy credentials to .env.docker

# 3. Start stack
docker compose up -d

# 4. Verify
docker compose ps
# All services should be "healthy"

# 5. Access app
# Navigate to http://localhost:3000
```

**Troubleshooting Common Issues**:
- "Port 3000 already in use" → `lsof -ti:3000 | xargs kill`
- "PostgreSQL unhealthy" → Check `docker compose logs postgres`
- "Garage credentials not working" → Re-run `init-garage.sh`
- "App can't connect to database" → Verify `.env.docker` has correct password

**Backup & Restore**:
```bash
# Backup
./scripts/backup-db.sh
./scripts/backup-volumes.sh

# Restore from backup
docker compose down -v  # Delete volumes
docker compose up -d postgres
docker exec -i little-roamers-postgres psql -U postgres little_roamers < backups/little-roamers-db-TIMESTAMP.sql
docker compose up -d
```

---

### Phase 5: Code Updates

#### 11. Update `next.config.ts`
Add standalone output and update image remote patterns for Docker.

**Changes**:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // NEW: Required for Docker
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'garage', // CHANGED: Use Docker service name
        port: '3900',
        pathname: '/little-roamers/**',
      },
    ],
  },
};
```

#### 12. Update `.gitignore`
Ensure Docker-related files are properly excluded.

**Add**:
```
# Docker
.env.docker
garage.toml
backups/
```

---

## Comprehensive Testing Plan

### Phase 1: Fresh Deployment Test (15 minutes)

**Objective**: Verify complete stack deployment from scratch

**Prerequisites**:
- Docker and Docker Compose installed
- No existing Little Roamers containers or volumes
- Ports 3000, 5432, 3900 available

**Steps**:

1. **Setup Environment**
   ```bash
   cp .env.docker.example .env.docker
   # Edit .env.docker: Set POSTGRES_PASSWORD=strongpassword123
   ```
   ✅ Expected: `.env.docker` file created

2. **Initialize Garage**
   ```bash
   chmod +x scripts/*.sh
   ./scripts/init-garage.sh
   ```
   ✅ Expected:
   - `garage.toml` created
   - Garage container running
   - Credentials displayed
   - Copy `GARAGE_ACCESS_KEY_ID` and `GARAGE_SECRET_ACCESS_KEY` to `.env.docker`

3. **Start Full Stack**
   ```bash
   docker compose up -d
   ```
   ✅ Expected: 3 containers start (postgres, garage, app)

4. **Verify Health**
   ```bash
   docker compose ps
   ./scripts/health-check.sh
   ```
   ✅ Expected: All containers show "healthy" status

5. **Access Application**
   - Navigate to http://localhost:3000
   ✅ Expected: Feed page loads (empty state)

### Phase 2: Functionality Test (10 minutes)

**Objective**: Verify CRUD operations and image upload

**Test Cases**:

1. **Create Activity without Image**
   - Click "Log Activity"
   - Fill: Title="Morning walk", Date=Today, Duration=45 minutes
   - Submit
   ✅ Expected: Activity appears in feed

2. **Create Activity with JPG Image**
   - Click "Log Activity"
   - Toggle "Full Entry" mode
   - Upload JPG image
   - Fill all fields (distance, elevation, people, tags, weather)
   - Submit
   ✅ Expected: Activity with image appears in feed

3. **Create Activity with HEIC Image** (if on macOS/iOS)
   - Upload HEIC file
   ✅ Expected: Image auto-converts to JPG, displays correctly

4. **Edit Activity**
   - Click activity card
   - Click "Edit"
   - Change title and duration
   - Save
   ✅ Expected: Changes reflected immediately

5. **Delete Activity**
   - On detail page, click "Delete"
   ✅ Expected: Activity removed from feed, image deleted from Garage

### Phase 3: Data Persistence Test (5 minutes)

**Objective**: Verify data survives container restarts

**Steps**:

1. **Create Test Data**
   - Create 3 activities with images
   - Note activity titles

2. **Stop Containers**
   ```bash
   docker compose down
   ```
   ✅ Expected: Containers stopped, volumes remain

3. **Restart Containers**
   ```bash
   docker compose up -d
   ```
   ✅ Expected: Containers start successfully

4. **Verify Data**
   - Navigate to http://localhost:3000
   ✅ Expected: All 3 activities still present with images

5. **Database Verification**
   ```bash
   docker exec little-roamers-postgres psql -U postgres -d little_roamers -c "SELECT COUNT(*) FROM activities;"
   ```
   ✅ Expected: Count = 3

### Phase 4: Backup & Restore Test (10 minutes)

**Objective**: Verify backup procedures work

**Steps**:

1. **Create Sample Data**
   - Create 5 activities with images

2. **Database Backup**
   ```bash
   ./scripts/backup-db.sh
   ```
   ✅ Expected: SQL dump in `backups/` directory

3. **Volume Backup**
   ```bash
   ./scripts/backup-volumes.sh
   ```
   ✅ Expected: 3 tar.gz files in `backups/` directory

4. **Destructive Test** (optional)
   ```bash
   docker compose down -v  # Delete volumes
   ```
   ✅ Expected: All data deleted

5. **Restore from Backup**
   ```bash
   docker compose up -d postgres
   sleep 5
   docker exec -i little-roamers-postgres psql -U postgres little_roamers < backups/little-roamers-db-*.sql
   docker compose up -d
   ```
   ✅ Expected: All 5 activities restored

### Phase 5: Image Lifecycle Test (5 minutes)

**Objective**: Verify image storage, retrieval, deletion

**Steps**:

1. **Upload Different Types**
   - JPG: ✅ Expected success
   - PNG: ✅ Expected success
   - HEIC: ✅ Expected success (auto-converted)
   - 12MB image: ✅ Expected rejection (max 10MB)

2. **Verify Garage Storage**
   ```bash
   docker exec little-roamers-garage garage bucket list little-roamers
   ```
   ✅ Expected: Shows uploaded images with `walks/` prefix

3. **Replace Image**
   - Edit activity, upload new image
   ✅ Expected: Old image deleted, new image appears

4. **Delete Activity**
   - Delete activity with image
   - Check Garage: `docker exec little-roamers-garage garage bucket list little-roamers`
   ✅ Expected: Image removed from storage

### Phase 6: Troubleshooting Test (5 minutes)

**Objective**: Verify documentation helps debug issues

**Simulated Failures**:

1. **Wrong PostgreSQL Password**
   - Set incorrect password in `.env.docker`
   - Run `docker compose up -d`
   ✅ Expected: App logs show connection error

2. **Missing Garage Credentials**
   - Clear `GARAGE_ACCESS_KEY_ID` in `.env.docker`
   - Run `docker compose up -d`
   ✅ Expected: App logs show Garage connection error

3. **Port Conflict**
   - Run another service on port 3000
   - Run `docker compose up -d`
   ✅ Expected: Docker shows port conflict error

---

## User Testing Checklist

Provide to user after implementation:

```markdown
# Little Roamers Docker Deployment - User Test

## Setup (15 minutes)
- [ ] Clone repository
- [ ] Create .env.docker from template
- [ ] Set strong POSTGRES_PASSWORD
- [ ] Run scripts/init-garage.sh
- [ ] Copy Garage credentials to .env.docker
- [ ] Run docker compose up -d
- [ ] All containers show "healthy" status

## Basic Functionality (10 minutes)
- [ ] Create activity without image
- [ ] Create activity with JPG image
- [ ] Create activity with PNG image
- [ ] Create activity with HEIC image (if available)
- [ ] View activity details
- [ ] Edit activity
- [ ] Delete activity

## Data Persistence (5 minutes)
- [ ] Create 2 activities with images
- [ ] Run docker compose down
- [ ] Run docker compose up -d
- [ ] Both activities still present with images

## Backup & Restore (5 minutes)
- [ ] Run ./scripts/backup-db.sh
- [ ] Verify backup file in backups/ directory
- [ ] Run ./scripts/backup-volumes.sh
- [ ] Verify 3 tar.gz files created

## Issues Found
[Report any issues here]

## Overall Experience Rating
[ ] Easy (completed all tests without issues)
[ ] Moderate (minor issues, resolved with documentation)
[ ] Difficult (major issues, needed external help)

## Feedback
[Additional comments]
```

---

## Critical Files Summary

**Files to Create** (10 files):

1. `.dockerignore` - Exclude files from build context
2. `Dockerfile` - Multi-stage Next.js build
3. `.env.docker.example` - Environment template
4. `docker-compose.yml` - Service orchestration
5. `scripts/init-garage.sh` - Garage initialization
6. `scripts/verify-db.sh` - Database verification
7. `scripts/health-check.sh` - Health monitoring
8. `scripts/backup-db.sh` - Database backup
9. `scripts/backup-volumes.sh` - Volume backup
10. `DEPLOY.md` - Deployment documentation

**Files to Modify** (2 files):

1. `next.config.ts` - Add `output: 'standalone'`, update image hostname
2. `.gitignore` - Add `.env.docker`, `garage.toml`, `backups/`

---

## Success Criteria

**Deployment Success**:
- [ ] User runs `docker compose up -d`, app accessible at http://localhost:3000
- [ ] All 3 containers show "healthy" status within 2 minutes
- [ ] No manual config needed except `.env.docker` editing

**Functionality Success**:
- [ ] Create activity with image works end-to-end
- [ ] Image displays in feed and detail view
- [ ] Edit and delete operations work
- [ ] Data persists after container restart

**Documentation Success**:
- [ ] New user can deploy without external help
- [ ] Troubleshooting guide resolves common issues
- [ ] Backup/restore procedures work as documented

**User Testing Success**:
- [ ] User completes deployment in <15 minutes
- [ ] User creates 5 activities with images successfully
- [ ] User performs successful backup
- [ ] User rates experience "easy" or "moderate"

---

## Potential Challenges & Mitigations

**Challenge 1: Sharp/heic-convert in Alpine**
- **Issue**: Native modules may fail in Alpine
- **Mitigation**: Install `libc6-compat`, test with HEIC file
- **Fallback**: Switch to `node:20-slim` (Debian-based)

**Challenge 2: Next.js Standalone Build**
- **Issue**: Standalone output structure may differ
- **Mitigation**: Test build locally first, verify `.next/standalone/` structure
- **Fallback**: Copy full `.next/` directory (larger image)

**Challenge 3: Garage Initialization Timing**
- **Issue**: Garage may not be ready when init script runs
- **Mitigation**: 10-second sleep in script, retry logic for commands
- **Fallback**: Document manual initialization commands

**Challenge 4: Volume Backups on Windows**
- **Issue**: Backup scripts use Unix tar
- **Mitigation**: Test with Git Bash, provide PowerShell alternatives in DEPLOY.md
- **Fallback**: Document Docker Desktop backup UI

---

## Implementation Order

**Priority 1 (Critical Path)**:
1. `.dockerignore`
2. `Dockerfile`
3. `.env.docker.example`
4. `docker-compose.yml`
5. Update `next.config.ts`

**Priority 2 (Initialization)**:
6. `scripts/init-garage.sh`
7. `scripts/verify-db.sh`

**Priority 3 (Operations)**:
8. `scripts/health-check.sh`
9. `scripts/backup-db.sh`
10. `scripts/backup-volumes.sh`

**Priority 4 (Documentation)**:
11. `DEPLOY.md`
12. Update `.gitignore`

---

## Verification Steps After Implementation

Before user testing:

1. **Build Test**
   ```bash
   docker build -t little-roamers:test .
   ```
   ✅ Build succeeds without errors

2. **Compose Validation**
   ```bash
   docker compose config
   ```
   ✅ No YAML errors, environment vars interpolate correctly

3. **Fresh Deploy**
   - Delete all containers and volumes
   - Follow Quick Start in DEPLOY.md
   ✅ Complete deployment in <5 minutes

4. **Smoke Test**
   - Create activity with image
   - Restart containers
   - Activity persists
   ✅ Core functionality works

5. **Documentation Review**
   - All commands tested
   - Expected outputs documented
   - Troubleshooting covers common issues
   ✅ DEPLOY.md complete and accurate
