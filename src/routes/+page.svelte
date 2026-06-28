<script lang="ts">
	const steps = [
		{ n: '01', t: 'Inspect', d: 'Click any sender, link or phrase that feels off. Links reveal where they really lead.' },
		{ n: '02', t: 'Decide', d: 'Report it as phishing or trust it. Some safe-looking mail is a trap — and some scary mail is fine.' },
		{ n: '03', t: 'Learn', d: 'Every verdict is graded with the exact red flags you caught or missed, and why they matter.' }
	];
</script>

<svelte:head><title>Baitline — Spot the phish</title></svelte:head>

<main class="wrap">
	<nav class="nav">
		<div class="brand">
			<span class="glyph"></span><span class="bname">BAITLINE</span>
		</div>
		<div class="navlinks">
			<a class="navlink" href="/analyze">Analyze an email</a>
			<a class="navlink" href="/leaderboard">Leaderboard</a>
			<a class="ghost" href="/train">Start drill →</a>
		</div>
	</nav>

	<section class="hero">
		<div class="copy" style="animation: rise .5s ease both;">
			<span class="eyebrow">Phishing defense trainer</span>
			<h1>Spot the phish<br />before it hooks you.</h1>
			<p class="lede">
				A hands-on drill that sharpens the instinct security teams rely on. Work through a simulated
				inbox, inspect each message like an analyst, and learn to tell a real threat from a
				false alarm.
			</p>
			<div class="actions">
				<a class="primary" href="/train">Start the drill</a>
				<span class="meta mono">8 scenarios · ~3 minutes · no sign-up</span>
			</div>
		</div>

		<aside class="specimen" style="animation: rise .5s ease .12s both;" aria-hidden="true">
			<div class="spec-chrome">
				<span class="d r"></span><span class="d a"></span><span class="d g"></span>
				<span class="mono lbl">specimen · 01</span>
			</div>
			<div class="spec-body">
				<div class="spec-from">
					IT Service Desk
					<span class="addr mono">&lt;support@<mark>m1crosoft</mark>-help.co&gt;</span>
				</div>
				<div class="spec-subj">ACTION REQUIRED: password expires in 2 hours</div>
				<p class="spec-text">
					Verify your account immediately using the <mark class="m2">secure portal</mark> below or
					lose mailbox access.
				</p>
				<div class="spec-link">
					<span class="cta mono">acme-corp.com/login</span>
					<span class="reveal mono">→ secure-verify<b>.ru</b>/login</span>
				</div>
				<div class="spec-flags mono">
					<span>⚑ lookalike domain</span><span>⚑ urgency</span><span>⚑ link mismatch</span>
				</div>
			</div>
		</aside>
	</section>

	<section class="steps">
		{#each steps as s (s.n)}
			<div class="step">
				<span class="sn mono">{s.n}</span>
				<h3>{s.t}</h3>
				<p>{s.d}</p>
			</div>
		{/each}
	</section>
</main>

<style>
	.wrap {
		max-width: 1080px;
		margin: 0 auto;
		padding: 22px 22px 70px;
	}
	.nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 0 40px;
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
		transition: color 0.15s ease;
	}
	.ghost:hover {
		color: var(--color-cyan);
	}
	.navlinks {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.navlink {
		font-size: 13.5px;
		color: var(--color-dim);
		transition: color 0.15s ease;
	}
	.navlink:hover {
		color: var(--color-ink);
	}
	@media (max-width: 620px) {
		.navlink {
			display: none;
		}
	}

	.hero {
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: 40px;
		align-items: center;
		padding: 18px 0 56px;
	}
	h1 {
		font-size: clamp(40px, 6.4vw, 72px);
		line-height: 1.02;
		margin: 14px 0 0;
		letter-spacing: -0.025em;
	}
	.lede {
		margin: 22px 0 0;
		max-width: 480px;
		font-size: 16.5px;
		color: var(--color-dim);
	}
	.actions {
		margin-top: 30px;
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
	}
	.primary {
		padding: 15px 30px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 16px;
		color: var(--color-bg);
		background: var(--color-cyan);
		border-radius: 12px;
		box-shadow: 0 14px 40px rgba(34, 211, 238, 0.22);
		transition:
			transform 0.14s ease,
			filter 0.15s ease;
	}
	.primary:hover {
		transform: translateY(-2px);
		filter: brightness(1.07);
	}
	.meta {
		font-size: 12.5px;
		color: var(--color-faint);
	}

	/* specimen card */
	.specimen {
		border: 1px solid var(--color-line-strong);
		border-radius: 16px;
		background: linear-gradient(180deg, rgba(17, 29, 51, 0.7), rgba(11, 18, 32, 0.85));
		box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
		overflow: hidden;
		transform: rotate(1.2deg);
	}
	.spec-chrome {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 13px;
		border-bottom: 1px solid var(--color-line);
		background: rgba(7, 11, 18, 0.5);
	}
	.d {
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}
	.d.r {
		background: #fb6f84;
	}
	.d.a {
		background: #f7b955;
	}
	.d.g {
		background: #34d399;
	}
	.lbl {
		margin-left: 8px;
		font-size: 10.5px;
		color: var(--color-faint);
	}
	.spec-body {
		padding: 16px 18px 18px;
	}
	.spec-from {
		font-weight: 600;
		font-size: 14px;
	}
	.addr {
		display: block;
		font-size: 12px;
		color: var(--color-dim);
		margin-top: 2px;
	}
	mark {
		background: rgba(251, 111, 132, 0.22);
		color: var(--color-red);
		border-radius: 3px;
		padding: 0 2px;
	}
	mark.m2 {
		background: rgba(247, 185, 85, 0.2);
		color: var(--color-amber);
	}
	.spec-subj {
		margin-top: 12px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 15px;
	}
	.spec-text {
		margin: 9px 0 0;
		font-size: 13px;
		color: #cfd9e8;
	}
	.spec-link {
		margin-top: 14px;
		padding: 11px 13px;
		border-radius: 10px;
		border: 1px solid var(--color-line);
		background: rgba(34, 211, 238, 0.05);
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.spec-link .cta {
		color: var(--color-cyan);
		font-size: 13px;
	}
	.spec-link .reveal {
		font-size: 11px;
		color: var(--color-red);
	}
	.spec-link .reveal b {
		text-decoration: underline;
	}
	.spec-flags {
		margin-top: 13px;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		font-size: 10.5px;
	}
	.spec-flags span {
		color: var(--color-amber);
		border: 1px solid rgba(247, 185, 85, 0.3);
		border-radius: 99px;
		padding: 2px 9px;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		border-top: 1px solid var(--color-line);
		padding-top: 36px;
	}
	.step h3 {
		font-size: 19px;
		margin: 10px 0 7px;
	}
	.step p {
		margin: 0;
		font-size: 13.5px;
		color: var(--color-dim);
	}
	.sn {
		font-size: 12px;
		color: var(--color-cyan);
		letter-spacing: 0.1em;
	}

	@media (max-width: 860px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 30px;
		}
		.steps {
			grid-template-columns: 1fr;
			gap: 22px;
		}
		.specimen {
			transform: none;
		}
	}
</style>
