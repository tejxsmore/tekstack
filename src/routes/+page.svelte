<script lang="ts">
	const { data } = $props();
	const { tools, categories, platforms } = data;

	import { X } from '@lucide/svelte';
	import ToolCard from '$lib/components/card/ToolCard.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { replaceState } from '$app/navigation';

	let filter = $state(false);

	let selectedCategories = $state<string[]>([]);
	let selectedPlatforms = $state<string[]>([]);
	let searchQuery = $state('');

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);

		const categoryParam = urlParams.get('category');
		if (categoryParam && categories.some((cat: any) => cat.slug === categoryParam)) {
			selectedCategories = [categoryParam];
		}

		const platformParam = urlParams.get('platform');
		if (platformParam && platforms.some((plat: any) => plat.slug === platformParam)) {
			selectedPlatforms = [platformParam];
		}

		if (urlParams.has('category') || urlParams.has('platform')) {
			const newUrl =
				window.location.protocol + '//' + window.location.host + window.location.pathname;
			// window.history.replaceState({}, document.title, newUrl);
			replaceState(newUrl, {});
		}
	});

	function clearUrlParams() {
		const newUrl = window.location.pathname;
		replaceState(newUrl, {});
	}

	function toggleCategory(slug: string) {
		selectedCategories.includes(slug)
			? (selectedCategories = selectedCategories.filter((s) => s !== slug))
			: (selectedCategories = [...selectedCategories, slug]);

		clearUrlParams();
	}

	function togglePlatform(slug: string) {
		selectedPlatforms.includes(slug)
			? (selectedPlatforms = selectedPlatforms.filter((s) => s !== slug))
			: (selectedPlatforms = [...selectedPlatforms, slug]);

		clearUrlParams();
	}

	const filteredTools = $derived(
		tools.filter(
			(tool) =>
				(selectedCategories.length === 0 || selectedCategories.includes(tool.category.slug)) &&
				(selectedPlatforms.length === 0 ||
					(Array.isArray(tool.platform) &&
						tool.platform.find((platform: any) => selectedPlatforms.includes(platform.slug)))) &&
				(searchQuery.length < 2 || tool.name.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	function clearAllFilters() {
		selectedCategories = [];
		selectedPlatforms = [];

		clearUrlParams();
	}

	let modalRef = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!filter) return;

		function handleClickOutside(event: MouseEvent) {
			if (modalRef && !modalRef.contains(event.target as Node)) {
				filter = false;
			}
		}

		function handleEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				filter = false;
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);

		onDestroy(() => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		});
	});
</script>

<svelte:head>
	<title>Tekstack</title>
</svelte:head>

<div class="space-y-6 p-6">
	<div class="mx-auto space-y-10 py-15 md:max-w-2xl md:pt-0">
		<div class="text-center">
			<h1 class="text-3xl leading-tight font-extrabold md:text-5xl lg:text-6xl">
				Cut through the noise, <br />
				<span
					class="bg-gradient-to-r from-[#3D90D7] via-[#3A59D1] to-[#D84040] bg-clip-text text-transparent"
				>
					Find tools
				</span> <span> that work</span>
			</h1>
		</div>
		<div class="flex items-center gap-6">
			<input
				type="text"
				placeholder="Search tools"
				bind:value={searchQuery}
				class="w-full rounded-[16px] border border-[#393E46] bg-[#272829] p-3 ring-[#393E46] focus:ring-2 focus:outline-none"
			/>
			<button
				onclick={() => (filter = !filter)}
				class="z-20 cursor-pointer rounded-[16px] border border-[#4E71FF] bg-[#3A59D1] p-3 px-6 text-center delay-100 hover:bg-[#362FD9] focus:outline-none"
			>
				Filters
			</button>
		</div>
	</div>

	{#if filter}
		<div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#1a1a19] p-6">
			<div
				bind:this={modalRef}
				class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6 sm:max-w-xl"
			>
				<div class="flex justify-between">
					<h3 class="text-2xl font-semibold">Filters</h3>
					<button
						onclick={() => (filter = false)}
						class="cursor-pointer rounded-[12px] border border-[#393E46] bg-[#272829] p-2 delay-100 hover:text-[#D84040]"
						><X size="20" /></button
					>
				</div>

				<h4 class="text-lg">Category</h4>
				<div class="grid grid-cols-2 gap-3">
					{#each categories as category}
						<button
							class="cursor-pointer rounded-[10px] border p-3 text-sm {selectedCategories.includes(
								category.slug
							)
								? 'border-[#4E71FF] bg-[#3A59D1] hover:bg-[#362FD9]'
								: 'border-[#393E46] hover:bg-[#272829]'}"
							onclick={() => {
								toggleCategory(category.slug);
							}}>{category.name}</button
						>
					{/each}
				</div>

				<h4 class="text-lg">Platform</h4>
				<div class="grid grid-cols-3 gap-3">
					{#each platforms as platform}
						<button
							class="cursor-pointer rounded-[10px] border p-1.5 text-sm
						{selectedPlatforms.includes(platform.slug)
								? 'border-[#4E71FF] bg-[#3A59D1] hover:bg-[#362FD9]'
								: 'border-[#393E46] hover:bg-[#272829]'}"
							onclick={() => {
								togglePlatform(platform.slug);
							}}>{platform.name}</button
						>
					{/each}
				</div>
				<button
					disabled={selectedCategories.length === 0 && selectedPlatforms.length === 0}
					class="w-full cursor-pointer rounded-[12px] border p-3 font-medium text-[#ECFAE5]
					{selectedCategories.length > 0 || selectedPlatforms.length > 0
						? 'border-[#AF3E3E] bg-[#D84040] hover:bg-[#BF3131]'
						: 'border-[#393E46]'}"
					onclick={clearAllFilters}>Clear All</button
				>
			</div>
		</div>
	{/if}

	<div class="flex justify-end text-sm text-gray-600">
		<p>Found {filteredTools.length} tools</p>
	</div>

	<div class="grid-cols grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each filteredTools as tool (tool.slug)}
			<ToolCard {tool} />
		{/each}
	</div>
</div>
