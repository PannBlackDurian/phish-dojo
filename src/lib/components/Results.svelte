<script lang="ts">
	import { game } from '$lib/state/game.svelte';

	let cuesTotal = $derived(game.deck.reduce((n, e) => n + e.cues.length, 0));
	let cuesCaught = $derived(game.outcomes.reduce((n, o) => n + o.caughtCueIds.length, 0));
	let falseAlarms = $derived(game.outcomes.reduce((n, o) => n + o.falseAlarmIds.length, 0));

	let rank = $derived.by(() => {
		const a = game.accuracy;
		if (a === 100 && cuesCaught >= cuesTotal * 0.75)
			return { name: 'Threat Hunter', tone: 'green', blurb: 'Elite instincts. You would make security teams sleep easier.' };
		if (a >= 80)
			return { name: 'Security Analyst', tone: 'cyan', blurb: 'Sharp eye. A few cues slipped past, but your judgement is sound.' };
		if (a >= 60)
			return { name: 'Aware', tone: 'amber', blurb: 'A solid base — tighten up on lookalike domains and link targets.' };
		return { name: 'At Risk', tone: 'red', blurb: 'Attackers would get through. Run it again and slow down on each sender.' };
	});

	function recapEmail(i: number) {
		return game.deck[i];
	}

	let alias = $state('');
	let saveState = $state<'idle' | 'saving' | 'done' | 'error'>('idle');

	async function submitScore() {
		if (alias.trim().length < 2 || saveState === 'saving' || saveState === 'done') return;
		saveState = 'saving';
		try {
			const res = await fetch('/api/runs', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					alias: alias.trim(),
					score: game.score,
					accuracy: game.accuracy,
					cuesCaught,
					cuesTotal,
					rank: rank.name
				})
			});
			saveState = res.ok ? 'done' : 'error';
		} catch {
			saveState = 'error';
		}
	}
</script>

<div class="results" style="animation: rise .4s ease both;">
	<span class="eyebrow">Drill complete</span>
	<h1 class="rank tone-{rank.tone}">{rank.name}</h1>
	<p class="blurb">{rank.blurb}</p>

	<div class="grid">
		<div class="metric">
			<span class="num tone-cyan">{game.score.toLocaleString()}</span>
			<span class="cap">Score</span>
		</div>
		<div class="metric">
			<span class="num">{game.accuracy}%</span>
			<span class="cap">Verdict accuracy</span>
		</div>
		<div class="metric">
			<span class="num">{cuesCaught}<span class="of">/{cuesTotal}</span></span>
			<span class="cap">Red flags caught</span>
		</div>
		<div class="metric">
			<span class="num">🔥 {game.bestStreak}</span>
			<span class="cap">Best streak</span>
		</div>
	</div>

	{#if falseAlarms > 0}
		<p class="note">You raised {falseAlarms} false {falseAlarms === 1 ? 'alarm' : 'alarms'} — over-flagging safe mail has a cost too.</p>
	{/if}

	<div class="recap">
		{#each game.outcomes as o, i (i)}
			{@const e = recapEmail(i)}
			<div class="rrow" class:bad={!o.correctVerdict}>
				<span class="rmark {o.correctVerdict ? 'ok' : 'no'}">{o.correctVerdict ? '✓' : '✕'}</span>
				<span class="rsubj">{e?.subject}</span>
				<span class="rtag {e?.isPhishing ? 'ph' : 'sf'}">{e?.isPhishing ? 'phishing' : 'safe'}</span>
			</div>
		{/each}
	</div>

	<div class="save">
		{#if saveState === 'done'}
			<p class="saved">✓ Saved. You're on the board.</p>
			<a class="lb" href="/leaderboard">View leaderboard →</a>
		{:else}
			<form
				class="saveform"
				onsubmit={(e) => {
					e.preventDefault();
					submitScore();
				}}
			>
				<input
					class="alias"
					bind:value={alias}
					placeholder="Your analyst alias"
					maxlength="24"
					aria-label="Analyst alias"
				/>
				<button class="save-btn" type="submit" disabled={alias.trim().length < 2 || saveState === 'saving'}>
					{saveState === 'saving' ? 'Saving…' : 'Save score'}
				</button>
			</form>
			{#if saveState === 'error'}<p class="err">Couldn't save — try again.</p>{/if}
		{/if}
	</div>

	<div class="cta-row">
		<button class="again" onclick={() => game.start()}>Run the drill again</button>
		<a class="home" href="/leaderboard">Leaderboard</a>
	</div>
</div>

<style>
	.results {
		max-width: 640px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 8px 0 40px;
	}
	.rank {
		font-size: clamp(36px, 7vw, 58px);
		font-weight: 700;
		letter-spacing: -0.02em;
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
	.blurb {
		margin: 0 auto;
		max-width: 460px;
		color: var(--color-dim);
		font-size: 15px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-top: 8px;
	}
	.metric {
		padding: 16px 10px;
		border: 1px solid var(--color-line);
		border-radius: 13px;
		background: rgba(15, 25, 43, 0.5);
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.num {
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 600;
	}
	.of {
		color: var(--color-faint);
		font-size: 17px;
	}
	.cap {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-faint);
	}
	.note {
		margin: 2px 0 0;
		font-size: 13px;
		color: var(--color-amber);
	}
	.recap {
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		text-align: left;
	}
	.rrow {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 9px 13px;
		border: 1px solid var(--color-line);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.015);
	}
	.rmark {
		font-family: var(--font-mono);
		font-size: 13px;
	}
	.rmark.ok {
		color: var(--color-green);
	}
	.rmark.no {
		color: var(--color-red);
	}
	.rsubj {
		flex: 1;
		font-size: 13.5px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #cfd9e8;
	}
	.rtag {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 2px 8px;
		border-radius: 6px;
		flex: 0 0 auto;
	}
	.rtag.ph {
		color: var(--color-red);
		background: rgba(251, 111, 132, 0.14);
	}
	.rtag.sf {
		color: var(--color-green);
		background: rgba(52, 211, 153, 0.13);
	}
	.cta-row {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-top: 14px;
		flex-wrap: wrap;
	}
	.again {
		padding: 14px 26px;
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 600;
		color: var(--color-bg);
		background: var(--color-cyan);
		border: 0;
		border-radius: 12px;
		cursor: pointer;
		transition: filter 0.15s ease;
	}
	.again:hover {
		filter: brightness(1.08);
	}
	.home {
		padding: 14px 22px;
		font-size: 14px;
		color: var(--color-dim);
		border: 1px solid var(--color-line-strong);
		border-radius: 12px;
	}
	.home:hover {
		color: var(--color-ink);
	}
	.save {
		margin-top: 18px;
		padding-top: 18px;
		border-top: 1px solid var(--color-line);
	}
	.saveform {
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.alias {
		font: inherit;
		font-size: 14px;
		padding: 12px 14px;
		min-width: 220px;
		color: var(--color-ink);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--color-line-strong);
		border-radius: 11px;
	}
	.alias::placeholder {
		color: var(--color-faint);
	}
	.alias:focus {
		outline: none;
		border-color: var(--color-cyan);
	}
	.save-btn {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 14px;
		padding: 12px 20px;
		color: var(--color-ink);
		background: rgba(34, 211, 238, 0.12);
		border: 1px solid rgba(34, 211, 238, 0.4);
		border-radius: 11px;
		cursor: pointer;
		transition: background 0.15s ease;
	}
	.save-btn:hover:not(:disabled) {
		background: rgba(34, 211, 238, 0.22);
	}
	.save-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.saved {
		margin: 0 0 8px;
		color: var(--color-green);
		font-weight: 600;
	}
	.lb {
		color: var(--color-cyan);
		font-size: 14px;
	}
	.err {
		margin: 8px 0 0;
		color: var(--color-red);
		font-size: 13px;
	}
	@media (max-width: 560px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
