<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="app">
	{@render children()}

	<footer class="foot">
		<span>
			<b>Baitline</b> — a phishing-awareness trainer, built as a portfolio piece by Pan Sreyoun.
		</span>
		<span class="stack mono">SvelteKit · Svelte 5 runes · TypeScript · Playwright</span>
	</footer>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.foot {
		margin-top: auto;
		display: flex;
		justify-content: space-between;
		gap: 14px;
		flex-wrap: wrap;
		padding: 18px 24px;
		border-top: 1px solid var(--color-line);
		font-size: 12.5px;
		color: var(--color-faint);
		max-width: 1080px;
		margin-left: auto;
		margin-right: auto;
		width: 100%;
	}
	.foot b {
		color: var(--color-dim);
		font-weight: 600;
	}
	.stack {
		font-size: 11.5px;
	}
</style>
