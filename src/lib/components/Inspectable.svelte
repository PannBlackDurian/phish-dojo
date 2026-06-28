<script lang="ts">
	import { game } from '$lib/state/game.svelte';
	import type { Severity } from '$lib/types';

	interface Props {
		ref: string;
		text: string;
		isCue: boolean;
		severity?: Severity;
		/** Cue label / explanation (cue) or reassurance note (decoy). */
		label?: string;
		detail?: string;
		/** Link variant reveals its true destination on inspect. */
		href?: string;
		variant?: 'token' | 'link' | 'sender';
	}

	let {
		ref,
		text,
		isCue,
		severity = 'medium',
		label = '',
		detail = '',
		href = '',
		variant = 'token'
	}: Props = $props();

	let flagged = $derived(game.isFlagged(ref));
	let reviewing = $derived(game.phase === 'feedback');
	let caught = $derived(reviewing && isCue && flagged);
	let missed = $derived(reviewing && isCue && !flagged);
	let falseAlarm = $derived(reviewing && !isCue && flagged);

	// Tooltip copy depends on the phase: honest inspection while deciding,
	// the full lesson once the verdict is in.
	let tip = $derived.by(() => {
		if (reviewing) {
			if (isCue) return `${label} — ${detail}`;
			if (flagged) return `False alarm. ${detail}`;
			return 'Verified safe.';
		}
		if (variant === 'link') return `Real destination → ${href}`;
		return flagged ? 'Marked as suspicious. Click to unflag.' : 'Click to flag as suspicious.';
	});

	let state = $derived(
		caught ? 'caught' : missed ? 'missed' : falseAlarm ? 'false' : flagged ? 'flagged' : 'idle'
	);

	function onclick() {
		if (!reviewing) game.toggleFlag(ref);
	}
</script>

<span class="wrap">
	<button
		type="button"
		class="chip {state} {variant}"
		data-state={state}
		aria-pressed={flagged}
		disabled={reviewing}
		{onclick}
	>
		{text}
		{#if state === 'flagged'}<span class="mark" aria-hidden="true">⚑</span>{/if}
		{#if caught}<span class="mark ok" aria-hidden="true">✓</span>{/if}
		{#if missed}<span class="mark warn" aria-hidden="true">⚑</span>{/if}
		{#if falseAlarm}<span class="mark warn" aria-hidden="true">!</span>{/if}
	</button>
	<span class="pop" role="tooltip">{tip}</span>
</span>

<style>
	.wrap {
		position: relative;
		display: inline;
	}
	.chip {
		font: inherit;
		color: inherit;
		background: transparent;
		border: 0;
		padding: 0 1px;
		cursor: pointer;
		border-radius: 4px;
		text-decoration: underline dotted rgba(148, 163, 184, 0.5);
		text-underline-offset: 3px;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			box-shadow 0.15s ease;
	}
	.chip.link {
		color: var(--color-cyan);
		font-family: var(--font-mono);
		text-decoration-color: rgba(34, 211, 238, 0.5);
	}
	.chip:hover:not(:disabled) {
		background: rgba(148, 163, 184, 0.12);
	}
	.chip.flagged {
		background: rgba(247, 185, 85, 0.18);
		color: var(--color-amber);
		text-decoration: none;
		box-shadow: inset 0 0 0 1px rgba(247, 185, 85, 0.45);
	}
	.chip.caught {
		background: rgba(52, 211, 153, 0.16);
		color: var(--color-green);
		text-decoration: none;
		box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.45);
	}
	.chip.missed {
		background: rgba(251, 111, 132, 0.16);
		color: var(--color-red);
		text-decoration: none;
		box-shadow: inset 0 0 0 1px rgba(251, 111, 132, 0.5);
	}
	.chip.false {
		background: rgba(247, 185, 85, 0.14);
		color: var(--color-amber);
		text-decoration: line-through;
		box-shadow: inset 0 0 0 1px rgba(247, 185, 85, 0.4);
	}
	.mark {
		font-size: 0.78em;
		margin-left: 2px;
		font-family: var(--font-mono);
	}
	.mark.ok {
		color: var(--color-green);
	}
	.mark.warn {
		color: var(--color-red);
	}

	/* Tooltip */
	.pop {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%) translateY(4px);
		width: max-content;
		max-width: 280px;
		padding: 9px 11px;
		font-family: var(--font-sans);
		font-size: 12.5px;
		line-height: 1.45;
		color: var(--color-ink);
		background: #0b1424;
		border: 1px solid var(--color-line-strong);
		border-radius: 9px;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.16s ease,
			transform 0.16s ease;
		z-index: 30;
		white-space: normal;
		text-align: left;
	}
	.pop::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: #0b1424;
	}
	.wrap:hover .pop,
	.chip:focus-visible + .pop {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
</style>
