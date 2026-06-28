// Applies the generated SQL migrations in ./drizzle to the database.
// Run with:  npm run db:migrate
// Targets the same DATABASE_URL the app uses — a local file, or a Turso DB.
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

const url = process.env.DATABASE_URL ?? 'file:local.db';
const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
const db = drizzle(client);

await migrate(db, { migrationsFolder: './drizzle' });
console.log(`✓ Migrations applied to ${url}`);
client.close();
