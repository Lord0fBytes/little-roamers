# Little Roamers - Version 0.2.0 Setup Guide

This guide will help you set up the database integration for Little Roamers Version 0.2.0.

**Note**: Little Roamers tracks all outdoor activities (hiking, playing, exploring, etc.), not just walks.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)

## Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in or create an account
2. Click "New Project"
3. Fill in the project details:
   - **Project Name**: `little-roamers` (or your preferred name)
   - **Database Password**: Choose a strong password (save it somewhere safe)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is perfect for personal use
4. Click "Create new project" and wait for setup to complete (2-3 minutes)

## Step 2: Create the Database Schema

1. In your Supabase project dashboard, navigate to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
6. You should see success messages indicating the table and policies were created

### Verify the Schema

Run this query in the SQL Editor to verify:

```sql
SELECT * FROM activities;
```

You should get an empty result set (no errors).

## Step 3: Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** → **API** (in the left sidebar)
2. Find these two values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **Project API Key** → `anon` `public`: A long string starting with `eyJ...`

## Step 4: Configure Environment Variables

1. In the project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Replace the placeholder values with your actual credentials from Step 3

⚠️ **Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 5: Install Dependencies

If you haven't already:

```bash
npm install
```

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing Version 0.2.0

Test the following functionality:

### 1. Create an Activity
- Click "Log Activity" button
- Fill in the form:
  - Title: "Morning hike"
  - Date: Today's date
  - Duration: 30 minutes
  - Notes: (optional)
- Click "Save Activity"
- You should be redirected to the feed

### 2. Verify Data Persistence
- **Refresh the page** (Cmd+R / Ctrl+R)
- The activity you created should still appear
- This confirms data is being saved to Supabase!

### 3. View Activity Details
- Click on the activity card
- Verify all details are displayed correctly

### 4. Edit an Activity
- On the activity detail page, click "Edit Activity"
- Change the title or duration
- Click "Update Activity"
- Verify changes are saved

### 5. Delete an Activity
- On the activity detail page, click "Delete Activity"
- Confirm the deletion
- You should be redirected to the feed
- The activity should be gone

### 6. Test in Supabase Dashboard
- Go to Supabase → **Table Editor** → `activities` table
- You should see any activities you've created
- Verify the data matches what's in the app

## Troubleshooting

### "Failed to fetch activities" Error

**Possible causes:**

1. **Environment variables not set**: Check `.env.local` file exists and has correct values
2. **Supabase credentials wrong**: Double-check you copied the correct URL and anon key
3. **Schema not created**: Make sure you ran the SQL schema in Supabase
4. **RLS policies**: Verify the RLS policy exists (run `schema.sql` again if needed)

**How to debug:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed API calls

### "Activity not found" on Detail Page

This can happen if:
- The activity was deleted
- You're using an invalid ID in the URL
- Database connection is lost

### Development Server Won't Start

Make sure port 3000 is available:

```bash
lsof -i :3000
kill -9 <PID>  # if something is using the port
```

## Database Utilities

### View All Activities

In Supabase SQL Editor:

```sql
SELECT * FROM activities ORDER BY activity_date DESC;
```

### Count Total Activities

```sql
SELECT COUNT(*) FROM activities;
```

### Clear All Activities

⚠️ **Warning**: This deletes all data!

```sql
DELETE FROM activities;
```

## Next Steps

After confirming Version 0.2.0 works:

- Version 0.3.0 will add enhanced fields (distance, elevation, GPS, people tags, etc.)
- Version 0.4.0 will add image upload via Cloudinary

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your Supabase project is active (not paused)
3. Review the `.env.local` file for typos
4. Try running the `schema.sql` script again

---

**Version**: 0.2.0
**Status**: Database Integration Complete ✅
