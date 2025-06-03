<script>
	let props = $props();
	const { tool } = props;
</script>

<div class="space-y-3 rounded-[16px] border border-[#393E46] bg-[#212121] p-6">
	<div class="flex justify-between">
		<a href={`/tool/${tool.slug}`} class="block space-y-3">
			<div class="flex h-12 w-12 items-center rounded-[12px] bg-[#272829] p-2">
				<img
					src={tool.logo.url}
					alt={`Logo of ${tool.name}`}
					class="h-full w-full rounded-[6px] object-contain transition hover:scale-105"
				/>
			</div>
			<h2 class="text-lg font-semibold">{tool.name}</h2>
		</a>
		{#if tool.toolType.slug && tool.toolType.slug !== 'none'}
			<div class="flex items-start">
				{#if tool.toolType.slug === 'sponsored'}
					<span
						class="inline-flex items-center gap-1.5 rounded-[8px] border border-[#FFB433]/30 bg-[#F3C623]/40 px-3 py-1.5 text-xs font-medium text-[#E4D4A3]"
					>
						<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
							/>
						</svg>
						{tool.toolType.title}
					</span>
				{:else if tool.toolType.slug === 'editors-choice'}
					<span
						class="inline-flex items-center gap-1.5 rounded-[8px] border border-[#4D4C7D] bg-[#4D4C7D]/70 px-3 py-1.5 text-xs font-medium text-[#C7B8E4]"
					>
						<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						{tool.toolType.title}
					</span>
				{:else if tool.toolType.slug === 'rising-star'}
					<span
						class="inline-flex items-center gap-1.5 rounded-[8px] border border-[#2A7D5B] bg-[#1F4A37] px-3 py-1.5 text-xs font-medium text-[#A3E4C7]"
					>
						<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 2L3 7l7 5 7-5-7-5zM10 12l-7-5v8l7 5 7-5V7l-7 5z" />
						</svg>
						{tool.toolType.title}
					</span>
				{/if}
			</div>
		{/if}
	</div>
	<p class="flex-grow pb-1">{tool.description.slice(0, 80)}</p>
	<a
		href={tool.websiteUrl}
		target="_blank"
		class="block w-full rounded-[12px] border border-[#4E71FF] bg-[#3A59D1] p-3 text-center delay-100 hover:bg-[#362FD9]"
	>
		Visit {tool.name}
	</a>
</div>
