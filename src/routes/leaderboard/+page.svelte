<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const medal = ['🥇', '🥈', '🥉'];

	function rankTone(r: string) {
		if (r.includes('Hunter')) return 'green';
		if (r.includes('Analyst')) return 'cyan';
		if (r.includes('Aware')) return 'amber';
		return 'red';
	}
</script>

<svelte:head><title>Baitline — Leaderboard</title></svelte:head>

<main class="wrap">
	<nav class="nav">
		<a class="brand" href="/">
			<span class="glyph"></span><span class="bname">BAITLINE</span>
		</a>
		<a class="ghost" href="/train">Start drill →</a>
	</nav>

	<header class="head">
		<span class="eyebrow">Leaderboard</span>
		<h1>Top analysts</h1>
		<p class="sub">{data.total} {data.total === 1 ? 'drill' : 'drills'} completed and counting.</p>
	</header>

	{#if data.top.length === 0}
		<div class="empty">
			<p>No runs yet. <a href="/train">Be the first to set a score →</a></p>
		</div>
	{:else}
		<div class="board">
			<div class="row header-row mono">
				<span class="c-rank">#</span>
				<span class="c-alias">Analyst</span>
				<span class="c-tier">Rating</span>
				<span class="c-acc">Accuracy</span>
				<span class="c-cues">Flags</span>
				<span class="c-score">Score</span>
			</div>
			{#each data.top as run, i (run.id)}
				<div class="row" class:podium={i < 3}>
					<span class="c-rank mono">{medal[i] ?? i + 1}</span>
					<span class="c-alias">{run.alias}</span>
					<span class="c-tier tone-{rankTone(run.rank)}">{run.rank}</span>
					<span class="c-acc mono">{run.accuracy}%</span>
					<span class="c-cues mono">{run.cuesCaught}/{run.cuesTotal}</span>
					<span class="c-score mono">{run.score.toLocaleString()}</span>
				</div>
			{/each}
		</div>
	{/if}
</main>

<style>
	.wrap {
		max-width: 760px;
		margin: 0 auto;
		padding: 22px 22px 70px;
	}
	.nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 0 36px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 9px;
	}
	.glyph {
		width: 13px;
		height: 13px;
		border-radius: 3px;
		background: var(--color-cyan);
		box-shadow: 0 0 16px var(--color-cyan);
	}
	.bname {
		font-family: var(--font-display);
		font-weight: 700;
		letter-spacing: 0.07em;
		font-size: 17px;
	}
	.ghost {
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--color-dim);
		padding: 8px 14px;
		border: 1px solid var(--color-line-strong);
		border-radius: 9px;
	}
	.ghost:hover {
		color: var(--color-cyan);
	}
	.head {
		margin-bottom: 26px;
	}
	h1 {
		font-size: clamp(32px, 5vw, 46px);
		margin: 10px 0 6px;
	}
	.sub {
		margin: 0;
		color: var(--color-dim);
		font-size: 14.5px;
	}
	.empty {
		padding: 40px;
		text-align: center;
		border: 1px dashed var(--color-line-strong);
		border-radius: 14px;
		color: var(--color-dim);
	}
	.empty a {
		color: var(--color-cyan);
	}
	.board {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.row {
		display: grid;
		grid-template-columns: 44px 1.4fr 1.2fr 0.9fr 0.7fr 0.9fr;
		align-items: center;
		gap: 10px;
		padding: 13px 16px;
		border: 1px solid var(--color-line);
		border-radius: 11px;
		background: rgba(15, 25, 43, 0.5);
	}
	.header-row {
		background: transparent;
		border: 0;
		padding: 0 16px;
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-faint);
	}
	.row.podium {
		border-color: var(--color-line-strong);
		background: rgba(34, 211, 238, 0.05);
	}
	.c-rank {
		font-size: 16px;
	}
	.c-alias {
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.c-tier {
		font-size: 13px;
		font-weight: 600;
	}
	.c-acc,
	.c-cues {
		color: var(--color-dim);
		font-size: 13px;
	}
	.c-score {
		text-align: right;
		color: var(--color-cyan);
		font-weight: 600;
	}
	.tone-green {
		color: var(--color-green);
	}
	.tone-cyan {
		color: var(--color-cyan);
	}
	.tone-amber {
		color: var(--color-amber);
	}
	.tone-red {
		color: var(--color-red);
	}
	@media (max-width: 620px) {
		.row {
			grid-template-columns: 34px 1.2fr 0.8fr 0.9fr;
		}
		.c-tier,
		.c-cues {
			display: none;
		}
	}
</style>
