<script lang="ts">
	const { slug, title } = $props();
</script>

<button
	onclick={() => console.log(`Post saved: ${title}`)}
	aria-label="save-button"
	class="flex items-center gap-1.5 rounded-[12px] p-3 delay-100 hover:bg-[#272829] focus:outline-none"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-bookmark-icon lucide-bookmark cursor-pointer"
		><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg
	>
</button>
