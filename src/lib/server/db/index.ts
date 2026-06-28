// =============================================================================
//  Database client (libSQL / Turso). Lives under `$lib/server`, so SvelteKit
//  guarantees it is never bundled into the browser.
//
//  Locally:  DATABASE_URL=file:local.db        (a plain SQLite file)
//  In prod:  DATABASE_URL=libsql://<db>.turso.io  + DATABASE_AUTH_TOKEN
//  One driver, both environments.
// =============================================================================

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const client = createClient({
	url: env.DATABASE_URL ?? 'file:local.db',
	authToken: env.DATABASE_AUTH_TOKEN
});

export const db = drizzle(client, { schema });
