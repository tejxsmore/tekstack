<script>
	const { data } = $props();
	const { author } = data;

	import BlogCard from '$lib/components/card/BlogCard.svelte';
</script>

<div class="space-y-6 p-6">
	<h1>{author.name}</h1>
	<div class="grid-cols grid gap-6 md:grid-cols-2 xl:grid-cols-3">
		{#each author.post as post}
			<BlogCard {post} />
		{/each}
	</div>
</div>
