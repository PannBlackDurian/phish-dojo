// =============================================================================
//  Seed script — loads the canonical email set from data/emails.ts into the DB.
//  Run with:  npm run db:seed   (after  npm run db:push  creates the tables).
//  Uses its own connection so it has no dependency on the SvelteKit runtime.
// =============================================================================

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { emails } from '../../data/emails';
import { scenarios } from './schema';

const url = process.env.DATABASE_URL ?? 'local.db';
const db = drizzle(new Database(url));

db.delete(scenarios).run();

for (let i = 0; i < emails.length; i++) {
	const e = emails[i];
	db.insert(scenarios)
		.values({
			id: e.id,
			subject: e.subject,
			isPhishing: e.isPhishing,
			difficulty: e.difficulty,
			orderIndex: i,
			data: e
		})
		.run();
}

console.log(`✓ Seeded ${emails.length} scenarios into ${url}`);
