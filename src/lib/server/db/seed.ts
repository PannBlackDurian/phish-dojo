// =============================================================================
//  Seed script — loads the canonical email set from data/emails.ts into the DB.
//  Run with:  npm run db:seed   (after  npm run db:migrate  creates the tables).
//  Targets the same DATABASE_URL the app uses — a local file, or a Turso DB.
// =============================================================================

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { emails } from '../../data/emails';
import { scenarios } from './schema';

const url = process.env.DATABASE_URL ?? 'file:local.db';
const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
const db = drizzle(client);

await db.delete(scenarios);

for (let i = 0; i < emails.length; i++) {
	const e = emails[i];
	await db.insert(scenarios).values({
		id: e.id,
		subject: e.subject,
		isPhishing: e.isPhishing,
		difficulty: e.difficulty,
		orderIndex: i,
		data: e
	});
}

console.log(`✓ Seeded ${emails.length} scenarios into ${url}`);
client.close();
