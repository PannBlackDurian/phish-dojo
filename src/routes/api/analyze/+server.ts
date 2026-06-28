// Server-side analysis of a pasted email — runs the same checks a real
// mail-security gateway would, and never trusts client-supplied verdicts.
import { error, json } from '@sveltejs/kit';
import { analyzeEmail } from '$lib/server/analyze';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let body: { text?: unknown };
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const text = String(body.text ?? '');
	if (text.trim().length < 10) throw error(400, 'Paste an email to analyze (at least a few words).');
	if (text.length > 20_000) throw error(413, 'That email is too large to analyze.');

	return json(analyzeEmail(text));
};
