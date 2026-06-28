// POST a completed drill to the leaderboard.
import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { runs } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

function int(v: unknown, min: number, max: number): number {
	const n = Math.floor(Number(v));
	if (!Number.isFinite(n)) return min;
	return Math.min(max, Math.max(min, n));
}

export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const alias = String(body.alias ?? '')
		.replace(/[^\p{L}\p{N} _.-]/gu, '')
		.trim()
		.slice(0, 24);
	if (alias.length < 2) throw error(400, 'Alias must be at least 2 characters');

	const cuesTotal = int(body.cuesTotal, 0, 999);

	const rows = await db
		.insert(runs)
		.values({
			alias,
			score: int(body.score, 0, 1_000_000),
			accuracy: int(body.accuracy, 0, 100),
			cuesCaught: int(body.cuesCaught, 0, cuesTotal),
			cuesTotal,
			rank: String(body.rank ?? 'Aware').slice(0, 32),
			createdAt: new Date()
		})
		.returning();

	return json({ ok: true, id: rows[0]?.id });
};
