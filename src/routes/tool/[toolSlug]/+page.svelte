<script lang="ts">
	const { data } = $props();
	const { tool, reviews } = data;
	let title = $state('');
	let content = $state('');

	import MarkdownParser from '$lib/components/MarkdownParser.svelte';

	const handleReview = async (event: Event) => {
		event.preventDefault();

		if (!title.trim() || !content.trim()) return;

		isLoading = true;

		try {
			const response = await fetch('/api/actions/review', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: title.trim(),
					content: content.trim(),
					toolId: tool.id
				})
			});

			if (response.ok) {
				title = '';
				content = '';
				window.location.reload();
			} else {
				console.error('Failed to submit comment:', await response.text());
			}
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
	};

	let addReview = $state(false);
	let isLoading = $state(false);

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
			<button
				onclick={() => (addReview = !addReview)}
				class="cursor-pointer rounded-[8px] border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50
				{addReview
					? 'border-[#AF3E3E] bg-[#D84040] hover:bg-[#BF3131]'
					: 'border-[#4E71FF] bg-[#3A59D1] hover:bg-[#362FD9]'}
				">{addReview ? 'Close Review' : 'Add Review'}</button
			>
		</div>

		{#if addReview}
			<form
				onsubmit={handleReview}
				class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6"
			>
				<div class="flex flex-col space-y-0.5">
					<label for="title">Title</label>
					<input
						type="text"
						name="title"
						bind:value={title}
						required
						class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					/>
				</div>
				<div class="flex flex-col space-y-0.5">
					<label for="content">Content</label>
					<textarea
						name="content"
						id="content"
						bind:value={content}
						required
						rows="5"
						class="resize-none rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					></textarea>
				</div>
				<button
					type="submit"
					disabled={isLoading}
					class="w-full cursor-pointer rounded-[16px] border-[#4E71FF] bg-[#3A59D1] p-3 font-medium text-white transition-colors duration-200 hover:bg-[#362FD9] disabled:cursor-not-allowed disabled:bg-blue-800"
				>
					{#if isLoading}
						<span class="flex items-center justify-center">
							<svg
								class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Submitting...
						</span>
					{:else}
						Submit
					{/if}
				</button>
			</form>
		{/if}

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
