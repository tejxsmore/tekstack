<script>
	let { session } = $props();

	import { onMount } from 'svelte';
	import SignOutButton from './auth/SignOutButton.svelte';
	import { Pen, UserRound } from '@lucide/svelte';

	let modal = $state(false);
	let modalElement = $state();
	let userButton = $state();

	/**
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		if (event.key === 'Escape' && modal) {
			modal = false;
		}
	}

	/**
	 * @param {MouseEvent} event
	 */
	function handleClickOutside(event) {
		if (modal && modalElement && userButton) {
			const target = /** @type {Node} */ (event.target);
			// Check if click is outside both modal and user button
			if (!modalElement.contains(target) && !userButton.contains(target)) {
				modal = false;
			}
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<svelte:document onkeydown={handleKeydown} />

<div class="flex items-center justify-between p-6">
	<div class="flex items-end sm:gap-12">
		<a href="/" class="text-4xl font-bold">TEKSTACK</a>
		<a href="/blog" class="hidden text-2xl font-semibold sm:block">Blog</a>
	</div>
	<div class="">
		{#if session}
			<div class="flex gap-3">
				<div class="group relative">
					<a href="/blog/write">
						<div
							class="cursor-pointer rounded-[16px] border border-[#393E46] bg-[#212121] p-3 transition-colors hover:bg-[#272829]"
						>
							<Pen />
						</div>
					</a>
					<div
						class="pointer-events-none absolute top-full left-1/2 z-20 mt-3 -translate-x-1/2 transform rounded-[12px] border border-[#393E46] bg-[#212121] p-1.5 px-3 text-sm whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					>
						Write a blog
					</div>
				</div>
				<div class="relative">
					<button
						bind:this={userButton}
						onclick={() => (modal = !modal)}
						class="cursor-pointer rounded-[16px] border border-[#393E46] bg-[#212121] p-3 transition-colors hover:bg-[#272829] focus:outline-none"
					>
						<UserRound />
					</button>
					{#if modal}
						<div
							bind:this={modalElement}
							class="absolute top-full right-0 z-20 mt-3 min-w-40 space-y-1 rounded-[16px] border border-[#393E46] bg-[#212121] p-1 text-center"
						>
							<a
								href="/user/profile"
								class="block rounded-[12px] p-3 transition-colors hover:bg-[#272829]">Profile</a
							>
							<a
								href="/user/settings"
								class="block rounded-[12px] p-3 transition-colors hover:bg-[#272829]">Settings</a
							>
							<SignOutButton />
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<a
				href="/sign-in"
				class="cursor-pointer rounded-[16px] border border-[#393E46] bg-[#212121] p-3 px-6 font-semibold delay-100 hover:bg-[#272829]"
				>Sign In</a
			>
		{/if}
	</div>
</div>
