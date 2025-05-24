<script>
	import BlogCard from '$lib/components/card/BlogCard.svelte';

	const { data } = $props();
	const { tag } = data;
</script>

<div class="space-y-6 p-6">
	<h1>#{tag.name}</h1>
	<div class="grid-cols grid gap-6 md:grid-cols-2 xl:grid-cols-3">
		{#each tag.post as post}
			<BlogCard {post} />
		{/each}
	</div>
</div>
