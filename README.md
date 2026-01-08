# Little Roamers

**Growing Up Outdoors**

A Progressive Web Application (PWA) for tracking individual walks and hikes with a social feed-style interface.

## Version

Current: **0.5.2** - Warm Aesthetic Transformation & Bug Fixes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Type**: Progressive Web App (PWA)
- **Database**: PostgreSQL (local server)
- **Image Storage**: Garage (self-hosted S3-compatible storage)
- **State Management**: Context API
- **Image Processing**: Sharp + heic-convert

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

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

## Version 0.5.2 Features

**Core Functionality:**
- ✅ Complete CRUD operations for activities (create, view, update, delete)
- ✅ PostgreSQL database with full persistence
- ✅ Image upload with HEIC/HEIF support (auto-converts to JPEG)
- ✅ Self-hosted Garage S3-compatible image storage
- ✅ Enhanced data model: distance, elevation, weather, tags, people

**User Interface:**
- ✅ Warm, nature-inspired design system (sage, sky, clay, sunshine colors)
- ✅ Nunito typography for friendly, readable experience
- ✅ Responsive feed with activity cards (1/2/3 column grid)
- ✅ Image preview with HEIC placeholder support
- ✅ Tag autocomplete for people and general tags
- ✅ Loading skeleton states with smooth animations
- ✅ Mobile-responsive forms with proper field stacking

**Bug Fixes:**
- ✅ Mobile gallery photo selection (removed camera-only constraint)
- ✅ Desktop change photo button visibility and styling
- ✅ HEIC image processing with heic-convert package
- ✅ Date display timezone handling (local vs UTC)
- ✅ Form field responsive layout (no overlap on mobile)

## Next Steps

**Version 0.6.0 - Filtering & Search** (Planned)
- Create FilterBar component for multi-select filtering
- Filter by people tags (multi-select)
- Filter by general tags (multi-select)
- Date range picker (from/to dates)
- Persist filters in URL query parameters for shareable links
- "Clear all filters" functionality
- Active filter count badge

See [project documentation](https://github.com/Lord0fBytes/little-roamers) for full roadmap and version history.
