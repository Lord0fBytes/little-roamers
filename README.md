# Little Roamers

**Growing Up Outdoors**

A Progressive Web Application (PWA) for tracking individual walks and hikes with a social feed-style interface.

## Version

Current: **0.1.0** - Foundation & Basic CRUD

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Type**: Progressive Web App (PWA)
- **Database**: Supabase (v0.2.0+)
- **State Management**: Context API

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

## Version 0.1.0 Features

- ✅ Walk TypeScript interfaces
- ✅ In-memory state management with Context API
- ✅ Simple feed view showing walk list
- ✅ Basic add walk form (title, duration, date, notes)
- ✅ CRUD operations (create, view, update, delete)
- ⚠️ No persistence (data lost on refresh - expected for v0.1.0)

## Next Steps

- Version 0.2.0: Database integration with Supabase
- Version 0.3.0: Enhanced data model with all fields
- Version 0.4.0: Cloudinary image upload

See project documentation for full roadmap.
