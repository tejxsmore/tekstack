<script lang="ts">
	const { data } = $props();
	const { post } = data;

	import MarkdownParser from '$lib/components/MarkdownParser.svelte';

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
	<title>{post?.title}</title>
</svelte:head>

<div class="flex items-center justify-center p-6">
	{#if post}
		<div class="w-full space-y-12 sm:max-w-4xl">
			<h1 class="pt-6 text-center text-3xl font-black md:text-6xl">{post.title}</h1>

			<div class="flex items-center justify-center gap-3 text-lg font-normal">
				<a href={`/blog/author/${post.author?.slug}`} class="">{post.author?.name}</a>
				<span> • </span>
				<p>{formatDate(post.createdAt)}</p>
			</div>

			<div class="flex flex-wrap justify-center gap-3">
				{#each post.tag as tag}
					<a
						href={`/blog/tag/${tag.slug}`}
						class="cursor-pointer rounded-[16px] border border-[#4E71FF] bg-[#3A59D1] p-3 px-6 text-center delay-100 hover:bg-[#362FD9] focus:outline-none"
						>#{tag.name}</a
					>
				{/each}
			</div>

			<div class="pt-6">
				<MarkdownParser content={post.content} />
			</div>
		</div>
	{:else}
		<p>No post found</p>
	{/if}
</div>
