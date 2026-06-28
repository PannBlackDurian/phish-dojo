import { desc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { runs } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const top = await db.select().from(runs).orderBy(desc(runs.score)).limit(25);
	const totalRows = await db.select({ c: sql<number>`count(*)` }).from(runs);
	const total = totalRows[0]?.c ?? 0;
	return { top, total };
};
