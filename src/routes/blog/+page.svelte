<script lang="ts">
	import { onMount } from 'svelte';
	import Fuse from 'fuse.js';
	import BlogCard from '$lib/components/card/BlogCard.svelte';

	const { data } = $props();
	const { posts } = data;

	let searchTerm = $state('');
	let fuse: Fuse<any>;
	let filteredPosts = $state(posts);
	let currentPage = $state(1);
	const postsPerPage = 12;

	const fuseOptions = {
		keys: [
			{ name: 'title', weight: 2 },
			{ name: 'author.name', weight: 1.5 },
			{ name: 'tag.name', weight: 1 }
		],
		threshold: 0.3,
		includeScore: true,
		minMatchCharLength: 1
	};

	onMount(() => {
		fuse = new Fuse(posts, fuseOptions);
	});

	// Reactive search function
	$effect(() => {
		if (!searchTerm.trim()) {
			filteredPosts = posts;
		} else if (fuse) {
			const results = fuse.search(searchTerm);
			filteredPosts = results.map((result) => result.item);
		}
		// Reset to first page when search changes
		currentPage = 1;
	});

	// Computed values for pagination
	const totalPages = $derived(Math.ceil(filteredPosts.length / postsPerPage));
	const startIndex = $derived((currentPage - 1) * postsPerPage);
	const endIndex = $derived(startIndex + postsPerPage);
	const paginatedPosts = $derived(filteredPosts.slice(startIndex, endIndex));

	// Pagination functions
	const goToPage = (page: number) => {
		currentPage = page;
		// Scroll to top when changing pages
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const nextPage = () => {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		}
	};

	const prevPage = () => {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		}
	};

	// Generate page numbers for pagination
	const getPageNumbers = (current: number, total: number) => {
		const pages: (number | string)[] = [];

		if (total <= 7) {
			// Show all pages if total is 7 or less
			for (let i = 1; i <= total; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (current > 4) {
				pages.push('...');
			}

			// Show pages around current page
			const start = Math.max(2, current - 1);
			const end = Math.min(total - 1, current + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (current < total - 3) {
				pages.push('...');
			}

			// Always show last page
			if (total > 1) {
				pages.push(total);
			}
		}

		return pages;
	};

	const pageNumbers = $derived(getPageNumbers(currentPage, totalPages));
</script>

<div class="p-6">
	<h1 class="text-center text-3xl font-bold">All Blogs</h1>

	<!-- Search Bar -->
	<div class="relative mx-auto mb-10 w-full py-6 sm:max-w-lg">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
			<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
		</div>
		<input
			type="text"
			bind:value={searchTerm}
			placeholder="Search blogs by title, author, or tags..."
			class="w-full rounded-[16px] border border-[#393E46] bg-[#191919] p-3 pl-10 ring-[#393E46] focus:ring focus:outline-none"
		/>
		{#if searchTerm}
			<button
				onclick={() => (searchTerm = '')}
				aria-label="Clear search"
				class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
			>
				<svg
					class="h-5 w-5 text-gray-400 hover:text-white"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	</div>

	<!-- Search Results Info -->
	{#if searchTerm}
		<p class="mb-4 text-sm text-gray-400">
			Found {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchTerm}"
		</p>
	{/if}

	<!-- Pagination Info -->
	{#if filteredPosts.length > 0}
		<div class="mb-6 flex items-center justify-between">
			<p class="text-sm text-gray-400">
				Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length}
				blogs
			</p>
			{#if totalPages > 1}
				<p class="text-sm text-gray-400">
					Page {currentPage} of {totalPages}
				</p>
			{/if}
		</div>
	{/if}

	<!-- Blog Grid -->
	<div class="grid-cols mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
		{#each paginatedPosts as post}
			<BlogCard {post} />
		{:else}
			{#if searchTerm}
				<div class="col-span-full text-center py-12">
					<svg
						class="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<h3 class="mt-6 text-sm font-medium">No blogs found</h3>
					<p class="mt-1.5 text-sm text-gray-500">Try adjusting your search terms</p>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Pagination Controls -->
	{#if totalPages > 1}
		<div class="flex items-center justify-center space-x-2">
			<!-- Previous Button -->
			<button
				onclick={prevPage}
				disabled={currentPage === 1}
				class="cursor-pointer rounded-[8px] border border-[#393E46] px-3
				py-1.5 text-sm hover:bg-[#272829] disabled:cursor-not-allowed disabled:opacity-50"
			>
				Previous
			</button>

			<!-- Page Numbers -->
			{#each pageNumbers as pageNum}
				{#if pageNum === '...'}
					<span class="px-3 py-1.5 text-sm font-medium text-gray-500">...</span>
				{:else}
					<button
						onclick={() => goToPage(pageNum as number)}
						class="cursor-pointer rounded-[8px] border px-3 py-1.5 text-sm font-medium {currentPage ===
						pageNum
							? 'border-[#4E71FF] bg-[#3A59D1] hover:bg-[#362FD9]'
							: 'border-[#393E46] bg-[#212121] hover:bg-[#272829]'}"
					>
						{pageNum}
					</button>
				{/if}
			{/each}

			<!-- Next Button -->
			<button
				onclick={nextPage}
				disabled={currentPage === totalPages}
				class="cursor-pointer rounded-[8px] border border-[#393E46] px-3
				py-1.5 text-sm hover:bg-[#272829] disabled:cursor-not-allowed disabled:opacity-50"
			>
				Next
			</button>
		</div>
	{/if}
</div>
