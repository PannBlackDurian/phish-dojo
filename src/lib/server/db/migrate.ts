// Applies the generated SQL migrations in ./drizzle to the database.
// Run with:  npm run db:migrate
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const url = process.env.DATABASE_URL ?? 'local.db';
const db = drizzle(new Database(url));

migrate(db, { migrationsFolder: './drizzle' });
console.log(`✓ Migrations applied to ${url}`);
