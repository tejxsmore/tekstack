<script lang="ts">
	const { data } = $props();
	const { tool, reviews } = data;

	import MarkdownParser from '$lib/components/MarkdownParser.svelte';

	let addReview = $state(false);

	function formatDate(isoDate: string): string {
		try {
			const date = new Date(isoDate);
			if (isNaN(date.getTime())) return 'Invalid date';

			const months = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			];

			const day = String(date.getDate()).padStart(2, '0');
			const month = months[date.getMonth()];
			const year = date.getFullYear();

			return `${day} ${month}, ${year}`;
		} catch {
			return 'Invalid date';
		}
	}
</script>

<svelte:head>
	<title>{tool.name} - {tool.category.name}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center space-y-5 p-5">
	<div class="w-full max-w-4xl space-y-6">
		<div class="flex gap-6">
			<div class="flex h-20 w-20 items-center rounded-[12px] bg-[#272829]">
				<img
					src={tool.logo.url}
					alt={`Logo of ${tool.name}`}
					class="p-3 transition hover:scale-110"
				/>
			</div>
			<div class="space-y-4">
				<h1 class="text-4xl font-semibold">{tool.name}</h1>
				<h2 class="text-sm">{tool.category.name}</h2>
			</div>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			<a
				href={tool.websiteUrl}
				target="_blank"
				class="block w-full rounded-[12px] border border-[#4E71FF] bg-[#3A59D1] p-3 px-6 text-center delay-100 hover:bg-[#362FD9]"
				>Visit {tool.name}</a
			>
			<a
				href={`/?category=${tool.category.slug}`}
				class="block w-full rounded-[12px] border border-[#393E46] p-3 px-6 text-center delay-100 hover:bg-[#272829]"
				>Other {tool.category.name} Apps</a
			>
		</div>
		<div class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6">
			<h3 class="text-xl font-semibold">TLDR;</h3>
			<p>{tool.description}</p>
		</div>

		<div class="py-6">
			<MarkdownParser content={tool.features} />
		</div>

		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold">Reviews</h2>
		</div>

		{#if reviews.length > 0}
			<div class="divide-y divide-[#212121]">
				{#each reviews as review}
					<div class="space-y-6 py-8">
						<div class="flex items-center gap-3">
							<div
								class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#272829] font-bold text-[#393E46]"
							>
								{review.userFullName?.charAt(0)}
							</div>
							<h4 class="font-semibold">{review.userFullName}</h4>
							<p class="text-xs text-gray-400">{formatDate(review.createdAt.toISOString())}</p>
						</div>
						<div class="space-y-3">
							<h1 class="text-2xl font-semibold">{review.title}</h1>
							<p class="">{review.content}</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-gray-500">Be the first one to review this tool</p>
		{/if}
	</div>
</div>
