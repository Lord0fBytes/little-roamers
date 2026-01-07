/**
 * Database Migration Script
 * Run: npx tsx scripts/migrate.ts
 */

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = postgres(connectionString);

async function runMigration() {
  try {
    console.log('🔄 Applying v0.4.0 migration...');
    console.log('Adding image_key field to activities table...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/v0.4.0-add-image-field.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!\n');

    // Verify columns were added
    console.log('📊 Verifying new columns...');
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'activities'
      ORDER BY ordinal_position
    `;

    console.log('\nActivities table columns:');
    result.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Close connection
    await sql.end();
    console.log('\n✅ Migration verified and complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
