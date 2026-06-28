// =============================================================================
//  Database client. Lives under `$lib/server`, so SvelteKit guarantees this
//  (and the native better-sqlite3 module) is never bundled into the browser.
// =============================================================================

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const url = process.env.DATABASE_URL ?? 'local.db';

const sqlite = new Database(url);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
