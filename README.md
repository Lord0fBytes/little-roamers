# Little Roamers

**Growing Up Outdoors**

A Progressive Web Application (PWA) for tracking individual walks and hikes with a social feed-style interface.

## Version

Current: **0.8.0** - Docker Deployment

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Type**: Progressive Web App (PWA)
- **Database**: PostgreSQL 16 (official image, Docker)
- **Image Storage**: Garage S3 v1.0.1 (self-hosted, Docker)
- **State Management**: Context API
- **Image Processing**: Sharp + heic-convert
- **Deployment**: Docker Compose (production-grade setup)

## Getting Started

### Docker Deployment (Recommended)

**Production-ready setup with Docker Compose:**

```bash
# 1. Create environment file
cp .env.docker.example .env.docker
# Edit .env.docker and set POSTGRES_PASSWORD

# 2. Initialize Garage S3
./scripts/init-garage.sh
# Copy credentials to .env.docker

# 3. Start the stack
docker compose up -d

# 4. Verify health
docker compose ps
./scripts/health-check.sh
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

**See [DEPLOY.md](./DEPLOY.md) for complete deployment guide.**

### Development Mode

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

**Note**: Development mode requires external PostgreSQL and Garage services.

## Project Structure

```
little-roamers/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
├── contexts/         # React Context providers
├── types/           # TypeScript type definitions
├── lib/             # Utility functions
└── public/          # Static assets
```

## Version 0.8.0 Features

**Docker Deployment (NEW):**
- ✅ Production-grade Docker Compose setup
- ✅ Multi-stage Dockerfile with Node 20 Alpine
- ✅ PostgreSQL 16 official image with named volumes
- ✅ Garage S3 v1.0.1 for self-hosted object storage
- ✅ Database migrations run from app container
- ✅ Health checks with smart dependency management
- ✅ Automated Garage initialization script
- ✅ Backup utilities for database and volumes
- ✅ Comprehensive deployment documentation (DEPLOY.md)

**Core Functionality:**
- ✅ Complete CRUD operations for activities (create, view, update, delete)
- ✅ PostgreSQL database with full persistence
- ✅ Image upload with HEIC/HEIF support (auto-converts to JPEG)
- ✅ Self-hosted Garage S3-compatible image storage
- ✅ Enhanced data model: distance, elevation, weather, tags, people
- ✅ Filtering & search (people, tags, date range)
- ✅ Statistics dashboard with charts and insights

**User Interface:**
- ✅ Warm, nature-inspired design system (sage, sky, clay, sunshine colors)
- ✅ Nunito typography for friendly, readable experience
- ✅ Responsive feed with activity cards (1/2/3 column grid)
- ✅ Image preview with HEIC placeholder support
- ✅ Tag autocomplete for people and general tags
- ✅ Loading skeleton states with smooth animations
- ✅ Mobile-responsive forms with proper field stacking

## Next Steps

**Version 0.9.0 - UI/UX Polish** (Planned)
- Bottom navigation bar (Feed, Dashboard, Add Activity)
- Confirmation dialogs for delete actions
- Success toast notifications
- Animations and transitions refinement
- Pull-to-refresh on mobile

**Version 1.0.0 - Production Launch** (Planned)
- Comprehensive testing across devices
- Performance optimization (Lighthouse >90)
- Production database and storage setup
- Final documentation polish
- Official release

**Future Enhancements (v1.1.0+):**
- Location data (GPS coordinates, location name)
- Garmin API integration
- Multi-user support with authentication
- Advanced statistics and analytics

See [CLAUDE.md](./CLAUDE.md) for full roadmap and version history.
