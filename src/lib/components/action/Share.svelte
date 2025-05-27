<script lang="ts">
	const { slug, title } = $props();
</script>

<button
	onclick={() => console.log(`Post shared: ${title}`)}
	aria-label="share-button"
	class="flex items-center gap-1.5 rounded-l-[12px] rounded-r-[30px] p-3 pr-4.5 delay-100 hover:bg-[#272829] focus:outline-none"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="currentColor"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-share2-icon lucide-share-2 cursor-pointer"
		><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle
			cx="18"
			cy="19"
			r="3"
		/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line
			x1="15.41"
			x2="8.59"
			y1="6.51"
			y2="10.49"
		/></svg
	>
</button>
