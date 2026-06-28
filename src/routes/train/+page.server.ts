// Serves the training deck from the database instead of the client bundle.
import { asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { scenarios } from '$lib/server/db/schema';
import type { TrainingEmail } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = db.select().from(scenarios).orderBy(asc(scenarios.orderIndex)).all();
	const deck: TrainingEmail[] = rows.map((r) => r.data);
	return { deck };
};
