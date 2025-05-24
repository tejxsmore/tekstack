<script>
	const { data } = $props();
	const tool = data.tool;

	import MarkdownParser from '$lib/components/MarkdownParser.svelte';
</script>

<div class="space-y-5 p-5">
	<img src={tool.logo.url} alt={`Logo of ${tool.name}`} />
	<h1>{tool.name}</h1>
	<h2>{tool.category.name}</h2>

	<div class="w-full sm:max-w-4xl">
		<MarkdownParser content={tool.features} />
	</div>
</div>
