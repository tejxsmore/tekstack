<script>
	const { data } = $props();
	const { post } = data;

	import MarkdownParser from '$lib/components/MarkdownParser.svelte';
</script>

<div class="p-6">
	{#if post}
		<h1>{post.title}</h1>
		<a href={`/blog/author/${post.author?.slug}`}>{post.author?.name}</a>

		{#each post.tag as tag}
			<a href={`/blog/tag/${tag.slug}`} class="text-orange-400">#{tag.name}</a>
		{/each}

		<div class="w-full sm:max-w-4xl">
			<MarkdownParser content={post.content} />
		</div>
	{:else}
		<p>No post found</p>
	{/if}
</div>
