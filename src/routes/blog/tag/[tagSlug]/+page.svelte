<script lang="ts">
	import BlogCard from '$lib/components/card/BlogCard.svelte';

	const { data } = $props();
	const { tag } = data;

	let currentPage = $state(1);
	const postsPerPage = 12;

	// Computed values for pagination
	const totalPages = $derived(Math.ceil(tag.post.length / postsPerPage));
	const startIndex = $derived((currentPage - 1) * postsPerPage);
	const endIndex = $derived(startIndex + postsPerPage);
	const paginatedPosts = $derived(tag.post.slice(startIndex, endIndex));

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

<svelte:head>
	<title>{tag?.name}</title>
</svelte:head>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold">#{tag.name}</h1>

	<!-- Pagination Info -->
	{#if tag.post.length > 0}
		<div class="mb-6 flex items-center justify-between">
			<p class="text-sm text-gray-600">
				Showing {startIndex + 1}-{Math.min(endIndex, tag.post.length)} of {tag.post.length}
				blogs
			</p>
			{#if totalPages > 1}
				<p class="text-sm text-gray-600">
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
			<div class="col-span-full text-center py-12">
				<h3 class="text-sm font-medium">No blogs found</h3>
				<p class="mt-1.5 text-sm text-gray-500">No blogs have been tagged with "{tag.name}" yet</p>
			</div>
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
