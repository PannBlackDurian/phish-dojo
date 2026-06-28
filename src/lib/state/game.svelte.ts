// =============================================================================
//  Game state — Svelte 5 runes.
//  A single reactive store drives the whole trainer: which email is open,
//  what the trainee has flagged, the running score/streak, and the per-email
//  outcome history used by the results screen.
// =============================================================================

import { emails } from '$lib/data/emails';
import type { Outcome, TrainingEmail, Verdict } from '$lib/types';

const STREAK_CAP = 6;
const POINTS_VERDICT = 100;
const POINTS_PER_CUE = 25;
const PENALTY_FALSE_ALARM = 15;
const STREAK_BONUS = 15;

function shuffle<T>(input: T[]): T[] {
	const arr = [...input];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

class Game {
	/** The pool the deck is drawn from — set once from server data, reused on replay. */
	sourceDeck = $state<TrainingEmail[]>([]);
	deck = $state<TrainingEmail[]>([]);
	index = $state(0);
	score = $state(0);
	streak = $state(0);
	bestStreak = $state(0);
	outcomes = $state<Outcome[]>([]);
	/** Refs the trainee has flagged on the *current* email. */
	flaggedRefs = $state<string[]>([]);
	/** 'verdict' = deciding; 'feedback' = reviewing the answer. */
	phase = $state<'verdict' | 'feedback'>('verdict');
	status = $state<'idle' | 'playing' | 'finished'>('idle');

	current = $derived<TrainingEmail | undefined>(this.deck[this.index]);
	total = $derived(this.deck.length);
	position = $derived(Math.min(this.index + 1, this.total));
	correctCount = $derived(this.outcomes.filter((o) => o.correctVerdict).length);
	accuracy = $derived(
		this.outcomes.length ? Math.round((this.correctCount / this.outcomes.length) * 100) : 0
	);
	lastOutcome = $derived<Outcome | undefined>(this.outcomes[this.outcomes.length - 1]);

	start(deck?: TrainingEmail[]) {
		if (deck && deck.length) this.sourceDeck = deck;
		const source = this.sourceDeck.length ? this.sourceDeck : emails;
		this.deck = shuffle(source);
		this.index = 0;
		this.score = 0;
		this.streak = 0;
		this.bestStreak = 0;
		this.outcomes = [];
		this.flaggedRefs = [];
		this.phase = 'verdict';
		this.status = 'playing';
	}

	reset() {
		this.status = 'idle';
		this.deck = [];
		this.outcomes = [];
	}

	isFlagged(ref: string): boolean {
		return this.flaggedRefs.includes(ref);
	}

	toggleFlag(ref: string) {
		if (this.phase !== 'verdict') return;
		this.flaggedRefs = this.isFlagged(ref)
			? this.flaggedRefs.filter((r) => r !== ref)
			: [...this.flaggedRefs, ref];
	}

	submit(verdict: Verdict) {
		const email = this.current;
		if (!email || this.phase !== 'verdict') return;

		const cueIds = email.cues.map((c) => c.id);
		const decoyIds = (email.decoys ?? []).map((d) => d.id);
		const caughtCueIds = this.flaggedRefs.filter((r) => cueIds.includes(r));
		const missedCueIds = cueIds.filter((id) => !this.flaggedRefs.includes(id));
		const falseAlarmIds = this.flaggedRefs.filter((r) => decoyIds.includes(r));

		const correctVerdict = verdict === (email.isPhishing ? 'phish' : 'trust');

		if (correctVerdict) {
			this.streak += 1;
			this.bestStreak = Math.max(this.bestStreak, this.streak);
		} else {
			this.streak = 0;
		}

		const base = correctVerdict ? POINTS_VERDICT : 0;
		const cueBonus = caughtCueIds.length * POINTS_PER_CUE;
		const streakBonus = correctVerdict ? STREAK_BONUS * Math.min(this.streak, STREAK_CAP) : 0;
		const penalty = falseAlarmIds.length * PENALTY_FALSE_ALARM;
		const points = Math.max(0, base + cueBonus + streakBonus - penalty);

		this.score += points;
		this.outcomes = [
			...this.outcomes,
			{ emailId: email.id, verdict, correctVerdict, caughtCueIds, missedCueIds, falseAlarmIds, points }
		];
		this.phase = 'feedback';
	}

	next() {
		if (this.index + 1 >= this.total) {
			this.status = 'finished';
			return;
		}
		this.index += 1;
		this.flaggedRefs = [];
		this.phase = 'verdict';
	}
}

export const game = new Game();
