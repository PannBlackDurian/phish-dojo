import { desc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { runs } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const top = db.select().from(runs).orderBy(desc(runs.score)).limit(25).all();
	const total = db.select({ c: sql<number>`count(*)` }).from(runs).get()?.c ?? 0;
	return { top, total };
};
