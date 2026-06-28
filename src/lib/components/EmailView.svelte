<script lang="ts">
	import type { TrainingEmail } from '$lib/types';
	import Inspectable from './Inspectable.svelte';

	let { email }: { email: TrainingEmail } = $props();

	function resolve(ref: string) {
		const cue = email.cues.find((c) => c.id === ref);
		if (cue)
			return { isCue: true, label: cue.label, detail: cue.explanation, severity: cue.severity };
		const decoy = email.decoys?.find((d) => d.id === ref);
		return { isCue: false, label: '', detail: decoy?.note ?? '', severity: 'low' as const };
	}

	let initials = $derived(
		email.from.name
			.split(/\s+/)
			.slice(0, 2)
			.map((w) => w[0])
			.join('')
			.toUpperCase()
	);
</script>

<article class="mail">
	<div class="chrome">
		<span class="dot r"></span><span class="dot a"></span><span class="dot g"></span>
		<span class="scan mono">inspect mode · click anything that looks off</span>
	</div>

	<div class="head">
		<div class="avatar" aria-hidden="true">{initials}</div>
		<div class="meta">
			<div class="row1">
				<span class="from-name">{email.from.name}</span>
				<span class="from-addr mono">
					&lt;{#if email.from.ref}<Inspectable
							ref={email.from.ref}
							text={email.from.email}
							variant="sender"
							{...resolve(email.from.ref)}
						/>{:else}{email.from.email}{/if}&gt;
				</span>
			</div>
			<div class="row2">to {email.to} · <span class="date">{email.date}</span></div>
		</div>
	</div>

	<h2 class="subject">
		{#if email.subjectRef}
			{#each [resolve(email.subjectRef)] as r (email.subjectRef)}
				<Inspectable ref={email.subjectRef} text={email.subject} {...r} />
			{/each}
		{:else}
			{email.subject}
		{/if}
	</h2>

	<div class="body">
		{#each email.body as para, pi (pi)}
			<p>
				{#each para as span, si (si)}
					{#if typeof span === 'string'}{span}{:else}<Inspectable
							ref={span.ref}
							text={span.text}
							{...resolve(span.ref)}
						/>{/if}
				{/each}
			</p>
		{/each}

		{#if email.links}
			<div class="links">
				{#each email.links as link, li (li)}
					<div class="link-card">
						<span class="cta">
							{#if link.ref}
								<Inspectable
									ref={link.ref}
									text={link.label}
									variant="link"
									href={link.href}
									{...resolve(link.ref)}
								/>
							{:else}
								<span class="link-plain">{link.label}</span>
							{/if}
						</span>
						<span class="shows mono">shows: {link.display}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</article>

<style>
	.mail {
		border: 1px solid var(--color-line);
		border-radius: 14px;
		background: linear-gradient(180deg, rgba(15, 25, 43, 0.6), rgba(11, 18, 32, 0.6));
		overflow: hidden;
	}
	.chrome {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 10px 14px;
		border-bottom: 1px solid var(--color-line);
		background: rgba(7, 11, 18, 0.5);
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		opacity: 0.85;
	}
	.dot.r {
		background: #fb6f84;
	}
	.dot.a {
		background: #f7b955;
	}
	.dot.g {
		background: #34d399;
	}
	.scan {
		margin-left: 10px;
		font-size: 11px;
		color: var(--color-faint);
		letter-spacing: 0.02em;
	}
	.head {
		display: flex;
		gap: 13px;
		align-items: center;
		padding: 18px 22px 14px;
	}
	.avatar {
		width: 42px;
		height: 42px;
		flex: 0 0 auto;
		border-radius: 11px;
		display: grid;
		place-items: center;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 15px;
		color: var(--color-bg);
		background: linear-gradient(135deg, var(--color-cyan), var(--color-violet));
	}
	.row1 {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px;
	}
	.from-name {
		font-weight: 600;
		font-size: 15.5px;
	}
	.from-addr {
		font-size: 12.5px;
		color: var(--color-dim);
	}
	.row2 {
		font-size: 12.5px;
		color: var(--color-faint);
		margin-top: 3px;
	}
	.subject {
		font-size: 19px;
		padding: 0 22px 4px;
		color: var(--color-ink);
	}
	.body {
		padding: 12px 22px 24px;
		font-size: 14.5px;
		color: #cfd9e8;
	}
	.body p {
		margin: 0 0 13px;
	}
	.links {
		margin-top: 18px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.link-card {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 13px 15px;
		border: 1px solid var(--color-line);
		border-radius: 11px;
		background: rgba(34, 211, 238, 0.05);
	}
	.cta {
		font-weight: 600;
		font-size: 14.5px;
	}
	.link-plain {
		color: var(--color-cyan);
	}
	.shows {
		font-size: 11.5px;
		color: var(--color-faint);
	}
</style>
