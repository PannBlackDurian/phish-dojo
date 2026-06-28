<script lang="ts">
	import { game } from '$lib/state/game.svelte';

	let flagCount = $derived(game.flaggedRefs.length);
</script>

<div class="verdict">
	<p class="hint">
		{#if flagCount === 0}
			Read carefully. Click any sender, link or phrase that looks off, then decide.
		{:else}
			You flagged <b>{flagCount}</b>
			{flagCount === 1 ? 'element' : 'elements'}. Now make the call.
		{/if}
	</p>
	<div class="buttons">
		<button class="btn phish" onclick={() => game.submit('phish')}>
			<span class="ico" aria-hidden="true">⚑</span>
			<span class="txt">Report phishing</span>
			<span class="kbd">P</span>
		</button>
		<button class="btn trust" onclick={() => game.submit('trust')}>
			<span class="ico" aria-hidden="true">✓</span>
			<span class="txt">Trust this email</span>
			<span class="kbd">T</span>
		</button>
	</div>
</div>

<style>
	.verdict {
		display: flex;
		flex-direction: column;
		gap: 13px;
	}
	.hint {
		margin: 0;
		text-align: center;
		font-size: 13px;
		color: var(--color-dim);
	}
	.hint b {
		color: var(--color-amber);
	}
	.buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 13px;
	}
	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		padding: 16px 12px;
		font-family: var(--font-display);
		font-size: 14.5px;
		font-weight: 600;
		white-space: nowrap;
		color: var(--color-ink);
		border-radius: 13px;
		border: 1px solid var(--color-line-strong);
		background: rgba(255, 255, 255, 0.02);
		cursor: pointer;
		transition:
			transform 0.12s ease,
			box-shadow 0.18s ease,
			background 0.18s ease;
	}
	.btn:hover {
		transform: translateY(-2px);
	}
	.btn:active {
		transform: translateY(0);
	}
	.btn .ico {
		font-family: var(--font-mono);
	}
	.btn .kbd {
		font-family: var(--font-mono);
		font-size: 11px;
		padding: 2px 7px;
		border-radius: 5px;
		border: 1px solid currentColor;
		opacity: 0.6;
	}
	.phish:hover {
		background: rgba(251, 111, 132, 0.16);
		border-color: var(--color-red);
		box-shadow: 0 10px 30px rgba(251, 111, 132, 0.18);
		color: var(--color-red);
	}
	.trust:hover {
		background: rgba(52, 211, 153, 0.14);
		border-color: var(--color-green);
		box-shadow: 0 10px 30px rgba(52, 211, 153, 0.16);
		color: var(--color-green);
	}
	@media (max-width: 560px) {
		.buttons {
			grid-template-columns: 1fr;
		}
	}
</style>
