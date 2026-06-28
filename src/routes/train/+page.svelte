<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/state/game.svelte';
	import ScoreBar from '$lib/components/ScoreBar.svelte';
	import EmailView from '$lib/components/EmailView.svelte';
	import VerdictBar from '$lib/components/VerdictBar.svelte';
	import Feedback from '$lib/components/Feedback.svelte';
	import Results from '$lib/components/Results.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	onMount(() => {
		if (game.status === 'idle') game.start(data.deck);
	});

	function onkeydown(e: KeyboardEvent) {
		if (game.status !== 'playing') return;
		const k = e.key.toLowerCase();
		if (game.phase === 'verdict') {
			if (k === 'p') game.submit('phish');
			else if (k === 't') game.submit('trust');
		} else if (k === 'n' || e.key === 'Enter') {
			game.next();
		}
	}
</script>

<svelte:head><title>Baitline — Training drill</title></svelte:head>
<svelte:window {onkeydown} />

<main class="stage">
	{#if game.status === 'finished'}
		<Results />
	{:else if game.current}
		<ScoreBar />
		<div class="console">
			{#key game.index}
				<div class="mailcol" style="animation: rise .3s ease both;">
					<EmailView email={game.current} />
				</div>
			{/key}
			<div class="actioncol">
				{#if game.phase === 'verdict'}
					<VerdictBar />
				{:else}
					<Feedback />
				{/if}
			</div>
		</div>
	{/if}
</main>

<style>
	.stage {
		max-width: 1040px;
		margin: 0 auto;
		padding: 24px 20px 60px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.console {
		display: grid;
		grid-template-columns: 1.35fr 1fr;
		gap: 18px;
		align-items: start;
	}
	.actioncol {
		position: sticky;
		top: 18px;
		padding: 18px;
		border: 1px solid var(--color-line);
		border-radius: 14px;
		background: linear-gradient(180deg, rgba(17, 29, 51, 0.55), rgba(13, 22, 38, 0.55));
	}
	@media (max-width: 880px) {
		.console {
			grid-template-columns: 1fr;
		}
		.actioncol {
			position: static;
		}
	}
</style>
