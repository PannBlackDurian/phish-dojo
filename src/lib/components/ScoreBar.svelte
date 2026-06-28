<script lang="ts">
	import { game } from '$lib/state/game.svelte';
</script>

<header class="bar">
	<div class="brand">
		<span class="glyph" aria-hidden="true"></span>
		<span class="name">BAITLINE</span>
		<span class="tag">phishing defense trainer</span>
	</div>

	<div class="progress" aria-label="Progress">
		<span class="count mono">{game.position} / {game.total}</span>
		<span class="track">
			{#each game.deck as _, i (i)}
				<span class="seg" class:done={i < game.index} class:active={i === game.index}></span>
			{/each}
		</span>
	</div>

	<div class="stats">
		<div class="stat">
			<span class="label">Streak</span>
			<span class="val streak" class:hot={game.streak >= 3}>
				{game.streak >= 1 ? '🔥' : '·'}
				{game.streak}
			</span>
		</div>
		<div class="stat">
			<span class="label">Score</span>
			<span class="val mono score">{game.score.toLocaleString()}</span>
		</div>
	</div>
</header>

<style>
	.bar {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 14px 22px;
		border: 1px solid var(--color-line);
		border-radius: 14px;
		background: linear-gradient(180deg, rgba(17, 29, 51, 0.7), rgba(13, 22, 38, 0.7));
		backdrop-filter: blur(6px);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 9px;
		flex: 0 0 auto;
	}
	.glyph {
		width: 12px;
		height: 12px;
		border-radius: 3px;
		background: var(--color-cyan);
		box-shadow: 0 0 14px var(--color-cyan);
	}
	.name {
		font-family: var(--font-display);
		font-weight: 700;
		letter-spacing: 0.06em;
		font-size: 16px;
	}
	.tag {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--color-faint);
		letter-spacing: 0.02em;
	}
	.progress {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}
	.count {
		font-size: 12px;
		color: var(--color-dim);
		flex: 0 0 auto;
	}
	.track {
		display: flex;
		gap: 5px;
		flex: 1;
	}
	.seg {
		height: 5px;
		flex: 1;
		border-radius: 99px;
		background: rgba(148, 163, 184, 0.16);
		transition: background 0.3s ease;
	}
	.seg.done {
		background: var(--color-cyan);
	}
	.seg.active {
		background: rgba(34, 211, 238, 0.5);
		box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
	}
	.stats {
		display: flex;
		gap: 22px;
		flex: 0 0 auto;
	}
	.stat {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		line-height: 1.1;
	}
	.label {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-faint);
	}
	.val {
		font-size: 18px;
		font-weight: 600;
	}
	.streak {
		color: var(--color-dim);
	}
	.streak.hot {
		color: var(--color-amber);
	}
	.score {
		color: var(--color-cyan);
	}
	@media (max-width: 720px) {
		.tag {
			display: none;
		}
		.bar {
			gap: 14px;
			padding: 12px 14px;
		}
	}
</style>
