# Little Roamers - Development Guide

## Version 0.1.0 - Foundation & Basic CRUD

### Current Features
- ✅ Walk CRUD operations (Create, Read, Update, Delete)
- ✅ In-memory state management (no database yet)
- ✅ Feed view with walk cards
- ✅ Add/Edit walk forms
- ✅ Walk detail view
- ⚠️ Data is NOT persisted (resets on page refresh)

### Project Structure

```
little-roamers/
├── app/
│   ├── layout.tsx           # Root layout with WalksProvider
│   ├── page.tsx              # Home/Feed page
│   ├── globals.css           # Global styles with Tailwind
│   └── walks/
│       ├── new/
│       │   └── page.tsx      # Add walk page
│       └── [id]/
│           ├── page.tsx      # Walk detail page
│           └── edit/
│               └── page.tsx  # Edit walk page
├── components/
│   ├── Button.tsx            # Reusable button component
│   ├── WalkCard.tsx          # Walk card for feed
│   └── WalkForm.tsx          # Form for add/edit
├── contexts/
│   └── WalksContext.tsx      # State management
├── types/
│   └── walk.ts               # TypeScript interfaces
└── lib/                      # Utilities (empty for now)
```

### Running the App

```bash
# Development mode
npm run dev

# Visit http://localhost:3000
# Try adding a walk, viewing it, editing it, and deleting it
```

### Testing v0.1.0

1. Start the dev server: `npm run dev`
2. Add a new walk via the "Add Walk" button
3. View the walk in the feed
4. Click a walk card to view details
5. Edit the walk using the "Edit Walk" button
6. Delete the walk using the "Delete Walk" button
7. Refresh the page - data will be lost (expected behavior for v0.1.0)

### Known Limitations (v0.1.0)

- No data persistence (in-memory only)
- No images
- No location, tags, or people fields
- No statistics or dashboard
- Not a PWA yet
- No offline support

These will be added in subsequent versions.

### Next Steps

- **v0.2.0**: Supabase database integration for persistent storage
- **v0.3.0**: Enhanced data model (distance, elevation, GPS, tags, people)
- **v0.4.0**: Cloudinary image uploads
- **v0.5.0**: Feed enhancements (responsive grid, pull-to-refresh)

### Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Context API for state management

### File Locations

- **Repository**: `/Users/justin/Documents/Coding/little-roamers`
- **Documentation**: Obsidian vault at `01 Projects/Coding/Little Roamers/`

### Development Workflow

1. Make changes to components/pages
2. Test in browser
3. Commit changes to Git
4. Document in activity log

For v0.2.0+, we'll add:
- Supabase for database
- Environment variables for API keys
- API routes for server-side operations
