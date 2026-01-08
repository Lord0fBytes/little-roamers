# Little Roamers - PostgreSQL Setup Guide

This guide will help you set up Little Roamers with a local or network PostgreSQL server.

**Note**: Little Roamers tracks all outdoor activities (hiking, playing, exploring, etc.), not just walks.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL server running (local or network)
- Database credentials (username, password, host, port)

## Step 1: Set Up PostgreSQL Database

### Option A: Database Already Exists

If your PostgreSQL server is already running with a database:

1. Get your connection details:
   - **Host**: IP address or hostname (e.g., `localhost` or `192.168.1.100`)
   - **Port**: Usually `5432`
   - **Database Name**: e.g., `little_roamers`
   - **Username**: e.g., `postgres`
   - **Password**: Your database password

2. Skip to Step 2

### Option B: Create New Database

If you need to create a new database:

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE little_roamers;

# Verify it was created
\l

# Exit
\q
```

## Step 2: Run the Schema

You have two options for running the schema:

### Option A: Using psql Command Line

```bash
# Navigate to the project directory
cd /path/to/little-roamers

# Run the schema file
psql -U postgres -h localhost -d little_roamers -f schema.sql

# Verify the table was created
psql -U postgres -h localhost -d little_roamers -c "SELECT * FROM activities;"
```

### Option B: Using a GUI Tool (pgAdmin, DBeaver, etc.)

1. Connect to your PostgreSQL server
2. Open the `little_roamers` database
3. Open a SQL query window
4. Copy and paste the contents of `schema.sql`
5. Execute the query
6. Verify the `activities` table was created

### Verify the Schema

Run this query to verify:

```sql
SELECT * FROM activities;
```

You should get an empty result set (no errors).

## Step 3: Configure Environment Variables

1. In the project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and set your DATABASE_URL:

   **Local PostgreSQL**:
   ```bash
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/little_roamers
   ```

   **Network PostgreSQL** (if on another machine):
   ```bash
   DATABASE_URL=postgresql://postgres:your_password@192.168.1.100:5432/little_roamers
   ```

   **Docker Container**:
   ```bash
   DATABASE_URL=postgresql://postgres:your_password@postgres:5432/little_roamers
   ```

3. Replace:
   - `postgres` with your actual username
   - `your_password` with your actual password
   - `localhost` or IP address with your PostgreSQL host
   - `5432` with your PostgreSQL port (if different)
   - `little_roamers` with your database name (if different)

⚠️ **Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

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
- This confirms data is being saved to PostgreSQL!

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

### 6. Test in PostgreSQL Directly
```bash
# Connect to database
psql -U postgres -h localhost -d little_roamers

# View activities
SELECT * FROM activities ORDER BY activity_date DESC;

# Count activities
SELECT COUNT(*) FROM activities;

# Exit
\q
```

## Troubleshooting

### "Failed to fetch activities" Error

**Possible causes:**

1. **DATABASE_URL not set**: Check `.env.local` file exists and has the correct connection string
2. **Connection refused**: PostgreSQL server might not be running or not accepting connections
3. **Authentication failed**: Wrong username or password in DATABASE_URL
4. **Database doesn't exist**: Make sure you created the `little_roamers` database
5. **Table doesn't exist**: Make sure you ran `schema.sql`

**How to debug:**

1. Test connection manually:
   ```bash
   psql "postgresql://postgres:password@localhost:5432/little_roamers"
   ```

2. Check PostgreSQL is running:
   ```bash
   # On macOS/Linux
   pg_isready -h localhost -p 5432

   # Check if process is running
   ps aux | grep postgres
   ```

3. Check server logs for connection errors

4. Open browser DevTools (F12) → Console tab for error messages

### Connection Refused

If PostgreSQL is not accepting network connections:

1. **Edit postgresql.conf**:
   ```
   listen_addresses = '*'  # or specific IP
   ```

2. **Edit pg_hba.conf** to allow connections:
   ```
   # IPv4 local connections:
   host    all             all             0.0.0.0/0            md5
   # or for local network:
   host    all             all             192.168.1.0/24       md5
   ```

3. **Restart PostgreSQL**:
   ```bash
   # On macOS
   brew services restart postgresql@15

   # On Linux
   sudo systemctl restart postgresql
   ```

### "Activity not found" on Detail Page

This can happen if:
- The activity was deleted
- You're using an invalid ID in the URL
- Database connection is lost

## Database Utilities

### View All Activities

```bash
psql -U postgres -h localhost -d little_roamers -c \
  "SELECT * FROM activities ORDER BY activity_date DESC;"
```

### Count Total Activities

```bash
psql -U postgres -h localhost -d little_roamers -c \
  "SELECT COUNT(*) FROM activities;"
```

### Clear All Activities

⚠️ **Warning**: This deletes all data!

```bash
psql -U postgres -h localhost -d little_roamers -c \
  "DELETE FROM activities;"
```

### Backup Database

```bash
pg_dump -U postgres -h localhost little_roamers > backup.sql
```

### Restore Database

```bash
psql -U postgres -h localhost little_roamers < backup.sql
```

## Docker Deployment

For production deployment with Docker Compose, create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: little_roamers
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:your_secure_password@postgres:5432/little_roamers
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Then run:

```bash
docker-compose up -d
```

## Next Steps

After confirming Version 0.2.0 works:

- Version 0.3.0 will add enhanced fields (distance, elevation, GPS, people tags, etc.)
- Version 0.4.0 will add image upload via Cloudinary

## Support

If you encounter issues:

1. Check PostgreSQL server is running
2. Verify connection string in `.env.local`
3. Check PostgreSQL logs for errors
4. Try connecting with `psql` manually to test credentials
5. Review browser console for client-side errors

---

**Version**: 0.2.0
**Database**: PostgreSQL (Direct Connection)
**Status**: Ready for Testing ✅
