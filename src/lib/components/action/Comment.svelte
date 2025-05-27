<script lang="ts">
	const { slug, title } = $props();

	let comments = $state(false);
</script>

<button
	onclick={() => (comments = true)}
	aria-label="comment-button"
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
		class="lucide lucide-message-circle-icon lucide-message-circle cursor-pointer"
		><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg
	>
	<span>0</span>
</button>

{#if comments}
	<div class=""></div>
{/if}
