// =============================================================================
//  Domain model for the Baitline phishing trainer.
//  Everything the UI renders flows from these types — emails are pure data,
//  so the dataset in `data/emails.ts` is the single source of truth.
// =============================================================================

export type Severity = 'high' | 'medium' | 'low';

/** A real phishing red flag the trainee is meant to catch. */
export interface Cue {
	id: string;
	/** Short name shown on the chip, e.g. "Lookalike domain". */
	label: string;
	/** Why this is suspicious — taught in the feedback panel. */
	explanation: string;
	severity: Severity;
}

/** A benign element that *looks* inspectable but is actually fine.
 *  Decoys make the judgement real: flagging one is a false alarm. */
export interface Decoy {
	id: string;
	/** Reassurance shown when a trainee wrongly flags it. */
	note: string;
}

/** One inline span of an email paragraph: plain text, or an inspectable token
 *  that references a Cue or Decoy by id. */
export type Span = string | { ref: string; text: string };

export interface EmailLink {
	/** The visible, clickable text. */
	label: string;
	/** What the link *appears* to lead to (often a lie in phishing). */
	display: string;
	/** Where it actually goes — the truth revealed on inspect. */
	href: string;
	/** Cue or decoy id, if this link is inspectable. */
	ref?: string;
}

export interface TrainingEmail {
	id: string;
	from: { name: string; email: string; ref?: string };
	to: string;
	subject: string;
	subjectRef?: string;
	date: string;
	isPhishing: boolean;
	/** Paragraphs, each an array of spans. */
	body: Span[][];
	links?: EmailLink[];
	cues: Cue[];
	decoys?: Decoy[];
	/** One-line takeaway shown after the verdict. */
	takeaway: string;
	difficulty: 1 | 2 | 3;
}

export type Verdict = 'phish' | 'trust';

export interface Outcome {
	emailId: string;
	verdict: Verdict;
	correctVerdict: boolean;
	caughtCueIds: string[];
	missedCueIds: string[];
	falseAlarmIds: string[];
	points: number;
}
