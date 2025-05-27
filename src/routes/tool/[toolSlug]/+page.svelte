<script lang="ts">
	const { data } = $props();
	const { tool } = data;

	import MarkdownParser from '$lib/components/MarkdownParser.svelte';
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
		<div
			class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6 sm:max-w-4xl"
		>
			<h3 class="text-xl font-semibold">Description</h3>
			<p>{tool.description}</p>
		</div>

		<div class="pt-3">
			<MarkdownParser content={tool.features} />
		</div>
	</div>
</div>
