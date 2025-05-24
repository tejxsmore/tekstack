<script>
	let props = $props();
	const { tool } = props;
</script>

<div class="space-y-3 rounded-[16px] border border-[#393E46] bg-[#212121] p-6">
	<div>
		<a href={`/tool/${tool.slug}`} class="block space-y-3">
			<div class="flex h-12 w-12 items-center rounded-[12px] bg-[#272829] p-2">
				<img
					src={tool.logo.url}
					alt={`Logo of ${tool.name}`}
					class="h-full w-full rounded-[6px] object-contain"
				/>
			</div>
			<h2 class="text-lg font-semibold">{tool.name}</h2>
		</a>
	</div>
	<p class="flex-grow">{tool.description.slice(0, 80)}</p>
	<a
		href={tool.websiteUrl}
		target="_blank"
		class="block w-full rounded-[12px] border border-[#4E71FF] bg-[#3A59D1] p-3 text-center delay-100 hover:bg-[#362FD9]"
	>
		Visit {tool.name}
	</a>
</div>
