# Little Roamers - Development Guide

## Version 0.5.2 - Warm Aesthetic & Bug Fixes

### Current Features
- ✅ Activity CRUD operations (Create, Read, Update, Delete)
- ✅ PostgreSQL database with full persistence
- ✅ Image upload with HEIC/HEIF support (Garage S3 storage)
- ✅ Enhanced data model (distance, elevation, weather, tags, people)
- ✅ Warm, nature-inspired design system
- ✅ Responsive feed with activity cards
- ✅ Tag autocomplete and loading states

### Project Structure

```
little-roamers/
├── app/
│   ├── layout.tsx                    # Root layout with ActivitiesProvider
│   ├── page.tsx                      # Home/Feed page
│   ├── globals.css                   # Global styles with Tailwind
│   ├── activities/
│   │   ├── new/
│   │   │   └── page.tsx              # Add activity page
│   │   └── [id]/
│   │       ├── page.tsx              # Activity detail page
│   │       └── edit/
│   │           └── page.tsx          # Edit activity page
│   └── api/
│       ├── activities/               # CRUD API routes
│       └── images/                   # Image upload/serving routes
├── components/
│   ├── Button.tsx                    # Reusable button component
│   ├── ActivityCard.tsx              # Activity card for feed
│   ├── ActivityCardSkeleton.tsx      # Loading skeleton
│   ├── ActivityForm.tsx              # Form for add/edit
│   ├── ImageUpload.tsx               # Image upload component
│   ├── TagInput.tsx                  # Tag autocomplete input
│   └── PeopleTagInput.tsx            # People tag input
├── contexts/
│   └── ActivitiesContext.tsx         # State management
├── types/
│   ├── activity.ts                   # TypeScript interfaces
│   └── heic-convert.d.ts             # HEIC library types
├── lib/
│   ├── db.ts                         # PostgreSQL connection
│   ├── garage.ts                     # S3 storage utilities
│   ├── imageOptimizer.ts             # Image processing with sharp
│   └── dateUtils.ts                  # Date parsing utilities
└── migrations/                       # Database migrations
```

### Running the App

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your PostgreSQL and Garage S3 credentials

# Run database migrations
npm run migrate

# Development mode
npm run dev

# Build for production
npm run build

# Visit http://localhost:3000
```

### Testing v0.5.2

1. Start the dev server: `npm run dev`
2. Add a new activity via the "Log Activity" button
3. Upload an image (HEIC files automatically convert to JPEG)
4. Add tags and people using autocomplete
5. View the activity in the feed
6. Click an activity card to view details
7. Edit the activity using the "Edit Activity" button
8. Delete the activity using the "Delete Activity" button
9. Refresh the page - data persists in PostgreSQL

### Known Limitations (v0.5.2)

- No filtering or search functionality (planned for v0.6.0)
- No statistics dashboard (planned for v0.7.0)
- Not a PWA yet (planned for v0.8.0)
- No offline support (planned for v0.8.0)
- No location/GPS data (planned for v1.1.0)

These will be added in subsequent versions.

### Next Steps

- **v0.6.0**: Filtering & Search (people, tags, date range)
- **v0.7.0**: Dashboard & Statistics
- **v0.8.0**: PWA capabilities
- **v0.9.0**: UI/UX polish
- **v1.0.0**: Production launch

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Database**: PostgreSQL (local or network)
- **Image Storage**: Garage (self-hosted S3-compatible)
- **Image Processing**: Sharp + heic-convert
- **State Management**: Context API

### Development Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes to components/pages
3. Test in browser at localhost:3000
4. Commit changes: `git commit -m "description"`
5. Push to GitHub: `git push origin feature/name`
6. Create Pull Request on GitHub
7. Merge after review
