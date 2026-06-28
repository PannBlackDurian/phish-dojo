<script lang="ts">
	import type { AnalysisResult } from '$lib/server/analyze';

	const SAMPLE = `From: IT Service Desk <support@m1crosoft-help.co>
Subject: ACTION REQUIRED: Your password expires in 2 hours

Dear User,

Our records indicate your email password will expire within 2 hours.
To avoid losing access you must verify your account immediately:

<a href="http://acme-corp.secure-verify.ru/login">https://acme-corp.com/login</a>

Failure to re-validate will result in permanent account suspension.

Regards,
The IT Service Desk Team`;

	let text = $state('');
	let result = $state<AnalysisResult | null>(null);
	let status = $state<'idle' | 'loading' | 'error'>('idle');
	let errorMsg = $state('');

	async function analyze() {
		if (text.trim().length < 10 || status === 'loading') return;
		status = 'loading';
		result = null;
		try {
			const res = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ text })
			});
			if (!res.ok) {
				errorMsg = (await res.json().catch(() => ({})))?.message ?? 'Analysis failed.';
				status = 'error';
				return;
			}
			result = await res.json();
			status = 'idle';
		} catch {
			errorMsg = 'Network error — is the server running?';
			status = 'error';
		}
	}

	const verdictMeta = {
		'high-risk': { label: 'High risk', tone: 'red', note: 'Strong phishing signals. Do not click, reply or act.' },
		suspicious: { label: 'Suspicious', tone: 'amber', note: 'Several warning signs. Verify before trusting.' },
		'likely-safe': { label: 'Likely safe', tone: 'green', note: 'No strong signals — still verify anything unexpected.' }
	} as const;

	const sevTone: Record<string, string> = { high: 'red', medium: 'amber', low: 'dim', info: 'green' };
</script>

<svelte:head><title>Baitline — Analyze an email</title></svelte:head>

<main class="wrap">
	<nav class="nav">
		<a class="brand" href="/"><span class="glyph"></span><span class="bname">BAITLINE</span></a>
		<a class="ghost" href="/train">Training drill →</a>
	</nav>

	<header class="head">
		<span class="eyebrow">Analyzer</span>
		<h1>Paste a suspicious email</h1>
		<p class="sub">
			The checks run on the server — the same way a real mail-security gateway inspects sender
			domains, links and language. Paste a real (or example) email and see what gets flagged.
		</p>
	</header>

	<div class="cols">
		<section class="input">
			<textarea
				bind:value={text}
				spellcheck="false"
				placeholder="Paste the full email here — including the From: line and any links…"
			></textarea>
			<div class="controls">
				<button class="analyze" onclick={analyze} disabled={text.trim().length < 10 || status === 'loading'}>
					{status === 'loading' ? 'Analyzing…' : 'Analyze email'}
				</button>
				<button class="sample" onclick={() => (text = SAMPLE)}>Load example</button>
				{#if text}<button class="clear" onclick={() => { text = ''; result = null; }}>Clear</button>{/if}
			</div>
			{#if status === 'error'}<p class="err">{errorMsg}</p>{/if}
		</section>

		<section class="output" aria-live="polite">
			{#if result}
				{@const v = verdictMeta[result.verdict]}
				<div class="verdict tone-{v.tone}" style="animation: rise .3s ease both;">
					<div class="gauge">
						<span class="score">{result.riskScore}</span><span class="max">/100</span>
					</div>
					<div class="vtext">
						<strong>{v.label}</strong>
						<span>{v.note}</span>
					</div>
				</div>

				<div class="meter">
					<span class="fill tone-{v.tone}" style="width:{result.riskScore}%"></span>
				</div>

				{#if result.sender}
					<div class="sender mono">
						<span class="lbl">sender</span>{result.sender.address}
						<span class="dom">· domain: {result.sender.domain}</span>
					</div>
				{/if}

				<div class="findings">
					<h4>{result.findings.length} {result.findings.length === 1 ? 'finding' : 'findings'}</h4>
					{#each result.findings as f (f.title + f.detail)}
						<div class="finding">
							<span class="dot tone-{sevTone[f.severity]}"></span>
							<div>
								<span class="ftitle">
									{f.title}
									<span class="sev sev-{f.severity}">{f.severity}</span>
								</span>
								<p>{f.detail}</p>
								{#if f.evidence}<code class="evi">{f.evidence}</code>{/if}
							</div>
						</div>
					{/each}
				</div>

				{#if result.links.length}
					<div class="links">
						<h4>Links ({result.stats.flaggedUrls} of {result.stats.urls} flagged)</h4>
						{#each result.links as l (l.url)}
							<div class="link" class:bad={l.suspicious}>
								<span class="lhost mono">{l.host}</span>
								{#if l.reasons.length}
									<ul>{#each l.reasons as r (r)}<li>{r}</li>{/each}</ul>
								{:else}
									<span class="ok">no issues detected</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<div class="placeholder">
					<p>Results appear here.</p>
					<p class="hint">Try the example, or paste a real email you weren't sure about.</p>
				</div>
			{/if}
		</section>
	</div>
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
		padding: 6px 0 30px;
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
		margin-bottom: 24px;
		max-width: 680px;
	}
	h1 {
		font-size: clamp(30px, 4.6vw, 44px);
		margin: 10px 0 8px;
	}
	.sub {
		margin: 0;
		color: var(--color-dim);
		font-size: 14.5px;
	}
	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
		align-items: start;
	}
	textarea {
		width: 100%;
		min-height: 360px;
		resize: vertical;
		font-family: var(--font-mono);
		font-size: 12.5px;
		line-height: 1.6;
		color: var(--color-ink);
		background: rgba(7, 11, 18, 0.6);
		border: 1px solid var(--color-line-strong);
		border-radius: 13px;
		padding: 16px;
	}
	textarea:focus {
		outline: none;
		border-color: var(--color-cyan);
	}
	.controls {
		display: flex;
		gap: 10px;
		margin-top: 12px;
		flex-wrap: wrap;
	}
	.analyze {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 15px;
		padding: 12px 24px;
		color: var(--color-bg);
		background: var(--color-cyan);
		border: 0;
		border-radius: 11px;
		cursor: pointer;
		transition: filter 0.15s ease;
	}
	.analyze:hover:not(:disabled) {
		filter: brightness(1.08);
	}
	.analyze:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.sample,
	.clear {
		font-family: var(--font-mono);
		font-size: 13px;
		padding: 12px 16px;
		color: var(--color-dim);
		background: transparent;
		border: 1px solid var(--color-line-strong);
		border-radius: 11px;
		cursor: pointer;
	}
	.sample:hover,
	.clear:hover {
		color: var(--color-ink);
	}
	.err {
		color: var(--color-red);
		font-size: 13px;
		margin: 10px 0 0;
	}

	.output {
		min-height: 360px;
		border: 1px solid var(--color-line);
		border-radius: 14px;
		background: rgba(15, 25, 43, 0.45);
		padding: 18px;
	}
	.placeholder {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		color: var(--color-faint);
		text-align: center;
	}
	.placeholder .hint {
		font-size: 13px;
	}
	.verdict {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 14px 16px;
		border-radius: 12px;
		border: 1px solid var(--color-line-strong);
	}
	.gauge {
		font-family: var(--font-display);
		display: flex;
		align-items: baseline;
		line-height: 1;
	}
	.score {
		font-size: 40px;
		font-weight: 700;
	}
	.max {
		font-size: 14px;
		color: var(--color-faint);
	}
	.vtext {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.vtext strong {
		font-size: 18px;
		font-family: var(--font-display);
	}
	.vtext span {
		font-size: 13px;
		color: var(--color-dim);
	}
	.tone-red {
		color: var(--color-red);
	}
	.tone-amber {
		color: var(--color-amber);
	}
	.tone-green {
		color: var(--color-green);
	}
	.tone-dim {
		color: var(--color-dim);
	}
	.verdict.tone-red {
		background: rgba(251, 111, 132, 0.1);
		border-color: rgba(251, 111, 132, 0.4);
	}
	.verdict.tone-amber {
		background: rgba(247, 185, 85, 0.1);
		border-color: rgba(247, 185, 85, 0.4);
	}
	.verdict.tone-green {
		background: rgba(52, 211, 153, 0.1);
		border-color: rgba(52, 211, 153, 0.4);
	}
	.verdict .vtext span {
		color: var(--color-dim);
	}
	.meter {
		height: 7px;
		border-radius: 99px;
		background: rgba(148, 163, 184, 0.16);
		margin: 12px 0;
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		border-radius: 99px;
		transition: width 0.5s ease;
	}
	.fill.tone-red {
		background: var(--color-red);
	}
	.fill.tone-amber {
		background: var(--color-amber);
	}
	.fill.tone-green {
		background: var(--color-green);
	}
	.sender {
		font-size: 12px;
		color: var(--color-dim);
		padding: 9px 11px;
		border: 1px solid var(--color-line);
		border-radius: 9px;
		margin-bottom: 14px;
		word-break: break-all;
	}
	.sender .lbl {
		color: var(--color-faint);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 9.5px;
		margin-right: 8px;
	}
	.sender .dom {
		color: var(--color-faint);
	}
	h4 {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-faint);
		margin: 0 0 11px;
	}
	.findings {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.finding {
		display: flex;
		gap: 11px;
		align-items: flex-start;
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		margin-top: 6px;
		flex: 0 0 auto;
		background: currentColor;
	}
	.ftitle {
		font-weight: 600;
		font-size: 14px;
		display: inline-flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}
	.sev {
		font-family: var(--font-mono);
		font-size: 9px;
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
	.sev-info {
		color: var(--color-green);
		background: rgba(52, 211, 153, 0.14);
	}
	.finding p {
		margin: 3px 0 0;
		font-size: 13px;
		color: var(--color-dim);
		line-height: 1.5;
	}
	.evi {
		display: inline-block;
		margin-top: 5px;
		font-family: var(--font-mono);
		font-size: 11.5px;
		color: var(--color-amber);
		background: rgba(247, 185, 85, 0.1);
		padding: 2px 7px;
		border-radius: 5px;
		word-break: break-all;
	}
	.links {
		margin-top: 18px;
		border-top: 1px solid var(--color-line);
		padding-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.link {
		padding: 10px 12px;
		border: 1px solid var(--color-line);
		border-radius: 9px;
	}
	.link.bad {
		border-color: rgba(251, 111, 132, 0.35);
		background: rgba(251, 111, 132, 0.06);
	}
	.lhost {
		font-size: 12.5px;
		color: var(--color-ink);
		word-break: break-all;
	}
	.link ul {
		margin: 7px 0 0;
		padding-left: 16px;
	}
	.link li {
		font-size: 12.5px;
		color: var(--color-red);
		margin-bottom: 3px;
	}
	.link .ok {
		display: block;
		margin-top: 4px;
		font-size: 12px;
		color: var(--color-green);
	}
	@media (max-width: 820px) {
		.cols {
			grid-template-columns: 1fr;
		}
		textarea {
			min-height: 220px;
		}
		.output {
			min-height: 0;
		}
	}
</style>
