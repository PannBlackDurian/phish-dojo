<script lang="ts">
	import { game } from '$lib/state/game.svelte';

	let email = $derived(game.current);
	let outcome = $derived(game.lastOutcome);
	let isLast = $derived(game.index + 1 >= game.total);

	let falseAlarms = $derived(
		email && outcome ? (email.decoys ?? []).filter((d) => outcome.falseAlarmIds.includes(d.id)) : []
	);
</script>

{#if email && outcome}
	<div class="fb" style="animation: rise .35s ease both;">
		<div class="banner" class:ok={outcome.correctVerdict} class:bad={!outcome.correctVerdict}>
			<span class="big">{outcome.correctVerdict ? '✓' : '✕'}</span>
			<div class="bannertext">
				<strong>
					{outcome.correctVerdict ? 'Correct call.' : 'Missed it.'}
					This email was {email.isPhishing ? 'a phishing attempt' : 'legitimate'}.
				</strong>
				<span class="pts">+{outcome.points} pts</span>
			</div>
		</div>

		{#if email.cues.length}
			<div class="block">
				<h4>Red flags{outcome.correctVerdict ? '' : ' you should have caught'}</h4>
				<ul>
					{#each email.cues as cue (cue.id)}
						{@const caught = outcome.caughtCueIds.includes(cue.id)}
						<li class:caught>
							<span class="tick {caught ? 'on' : 'off'}">{caught ? '✓' : '⚑'}</span>
							<div>
								<span class="cuelabel">
									{cue.label}
									<span class="sev sev-{cue.severity}">{cue.severity}</span>
									{#if caught}<span class="gotit">flagged</span>{/if}
								</span>
								<p>{cue.explanation}</p>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<div class="block">
				<h4>Why this one is safe</h4>
				<p class="safe">No genuine red flags — sender domain, links and request all check out.</p>
			</div>
		{/if}

		{#if falseAlarms.length}
			<div class="block">
				<h4>False alarms</h4>
				<ul>
					{#each falseAlarms as d (d.id)}
						<li>
							<span class="tick warn">!</span>
							<div><p>{d.note}</p></div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="takeaway">
			<span class="eyebrow">Takeaway</span>
			<p>{email.takeaway}</p>
		</div>

		<button class="next" onclick={() => game.next()}>
			{isLast ? 'See your results' : 'Next email'}
			<span class="kbd">N</span>
		</button>
	</div>
{/if}

<style>
	.fb {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.banner {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 15px 18px;
		border-radius: 13px;
		border: 1px solid var(--color-line-strong);
	}
	.banner.ok {
		background: rgba(52, 211, 153, 0.1);
		border-color: rgba(52, 211, 153, 0.4);
	}
	.banner.bad {
		background: rgba(251, 111, 132, 0.1);
		border-color: rgba(251, 111, 132, 0.42);
	}
	.big {
		font-family: var(--font-mono);
		font-size: 26px;
		line-height: 1;
	}
	.banner.ok .big {
		color: var(--color-green);
	}
	.banner.bad .big {
		color: var(--color-red);
	}
	.bannertext {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.bannertext strong {
		font-weight: 600;
		font-size: 15px;
	}
	.pts {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--color-cyan);
	}
	.block {
		border-top: 1px solid var(--color-line);
		padding-top: 14px;
	}
	.block h4 {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-faint);
		margin-bottom: 10px;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 11px;
	}
	li {
		display: flex;
		gap: 11px;
		align-items: flex-start;
	}
	.tick {
		font-family: var(--font-mono);
		font-size: 13px;
		width: 22px;
		height: 22px;
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		border-radius: 6px;
	}
	.tick.on {
		color: var(--color-green);
		background: rgba(52, 211, 153, 0.14);
	}
	.tick.off {
		color: var(--color-red);
		background: rgba(251, 111, 132, 0.14);
	}
	.tick.warn {
		color: var(--color-amber);
		background: rgba(247, 185, 85, 0.14);
	}
	.cuelabel {
		font-weight: 600;
		font-size: 14px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.sev {
		font-family: var(--font-mono);
		font-size: 9.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 1px 6px;
		border-radius: 5px;
	}
	.sev-high {
		color: var(--color-red);
		background: rgba(251, 111, 132, 0.16);
	}
	.sev-medium {
		color: var(--color-amber);
		background: rgba(247, 185, 85, 0.16);
	}
	.sev-low {
		color: var(--color-dim);
		background: rgba(148, 163, 184, 0.14);
	}
	.gotit {
		font-family: var(--font-mono);
		font-size: 9.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-green);
	}
	li p {
		margin: 3px 0 0;
		font-size: 13px;
		color: var(--color-dim);
		line-height: 1.5;
	}
	.safe {
		margin: 0;
		font-size: 13.5px;
		color: var(--color-green);
	}
	.takeaway {
		padding: 14px 16px;
		border-radius: 12px;
		background: rgba(34, 211, 238, 0.06);
		border: 1px solid rgba(34, 211, 238, 0.22);
	}
	.takeaway p {
		margin: 6px 0 0;
		font-size: 14px;
		color: var(--color-ink);
	}
	.next {
		margin-top: 2px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 14px;
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 600;
		color: var(--color-bg);
		background: var(--color-cyan);
		border: 0;
		border-radius: 12px;
		cursor: pointer;
		transition:
			filter 0.15s ease,
			transform 0.12s ease;
	}
	.next:hover {
		filter: brightness(1.08);
		transform: translateY(-1px);
	}
	.next .kbd {
		color: var(--color-bg);
		border-color: rgba(7, 11, 18, 0.5);
		opacity: 0.7;
	}
</style>
