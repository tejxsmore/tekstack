<script>
	import { onMount } from 'svelte';
	import SignOutButton from './auth/SignOutButton.svelte';
	import { Menu, UserRound } from '@lucide/svelte';
	import { userStore } from '$lib/stores/user';

	let modal = $state(false);
	let modalElement = $state();
	let menu = $state(false);
	let userButton = $state();
	let mobileMenuElement = $state();
	let menuButton = $state();

	/**
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			if (modal) {
				modal = false;
			}
			if (menu) {
				menu = false;
			}
		}
	}

	/**
	 * @param {MouseEvent} event
	 */
	function handleClickOutside(event) {
		const target = /** @type {Node} */ (event.target);

		// Handle user modal
		if (modal && modalElement && userButton) {
			if (!modalElement.contains(target) && !userButton.contains(target)) {
				modal = false;
			}
		}

		// Handle mobile menu - exclude menu button from outside clicks
		if (menu && mobileMenuElement && menuButton) {
			if (!mobileMenuElement.contains(target) && !menuButton.contains(target)) {
				menu = false;
			}
		}
	}

	function toggleMenu() {
		menu = !menu;
		console.log('Menu toggled:', menu); // Debug log
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<svelte:document onkeydown={handleKeydown} />

<div class="relative">
	<div class="flex items-center justify-between p-6">
		<div class="flex items-end gap-3 sm:gap-12">
			<a href="/" class="text-4xl font-bold">TEKSTACK</a>
			<a href="/blog" class="hidden text-2xl font-semibold sm:block">Blog</a>
		</div>
		<div class="">
			{#if $userStore}
				<div class="flex gap-3 sm:gap-0">
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
								class="animate-in slide-in-from-top-2 absolute top-full right-0 z-30 mt-3 min-w-40 space-y-1 rounded-[16px] border border-[#393E46] bg-[#212121] p-1 text-center duration-200"
							>
								<a
									href="/user/profile"
									class="block rounded-[12px] p-3 transition-colors hover:bg-[#272829]"
									onclick={() => (modal = false)}
								>
									Profile
								</a>
								<a
									href="/user/settings"
									class="block rounded-[12px] p-3 transition-colors hover:bg-[#272829]"
									onclick={() => (modal = false)}
								>
									Settings
								</a>
								<SignOutButton />
							</div>
						{/if}
					</div>
					<div>
						<button
							onclick={() => (menu = !menu)}
							class="block cursor-pointer rounded-[16px] border border-[#393E46] bg-[#212121] p-3 transition-colors hover:bg-[#272829] focus:outline-none sm:hidden"
							aria-label="Toggle mobile menu"
						>
							<Menu />
						</button>
					</div>
				</div>
			{:else}
				<div class="flex gap-3 sm:gap-0">
					<a
						href="/sign-in"
						class="cursor-pointer rounded-[16px] border border-[#AF3E3E] bg-[#D84040] p-3 px-6 font-medium text-[#ECFAE5] delay-100 hover:bg-[#BF3131]"
					>
						Sign In
					</a>
					<button
						onclick={() => (menu = !menu)}
						class="block cursor-pointer rounded-[16px] border border-[#393E46] bg-[#212121] p-3 transition-colors hover:bg-[#272829] focus:outline-none sm:hidden"
						aria-label="Toggle mobile menu"
					>
						<Menu />
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Mobile Menu Overlay -->
	{#if menu}
		<div
			bind:this={mobileMenuElement}
			class="animate-in slide-in-from-top-4 absolute top-full right-0 left-0 z-20 z-30 bg-[#212121] duration-300 ease-out sm:hidden"
		>
			<div class="space-y-3 p-3">
				<a
					href="/blog"
					class="block rounded-[12px] p-3 text-lg font-medium transition-colors hover:border-[#393E46] hover:bg-[#272829]"
					onclick={() => (menu = false)}
				>
					Best Software
				</a>
				<a
					href="/blog"
					class="block rounded-[12px] p-3 text-lg font-medium transition-colors hover:border-[#393E46] hover:bg-[#272829]"
					onclick={() => (menu = false)}
				>
					Blogs
				</a>
				{#if $userStore}
					<a
						href="/blog/write"
						class="block rounded-[12px] p-3 text-lg font-medium transition-colors hover:border-[#393E46] hover:bg-[#272829]"
						onclick={() => (menu = false)}
					>
						Write a Blog
					</a>
					<a
						href="/tool/submit"
						class="block rounded-[12px] p-3 text-lg font-medium transition-colors hover:border-[#393E46] hover:bg-[#272829]"
						onclick={() => (menu = false)}
					>
						Submit a Tool
					</a>
				{:else}
					<div class="border-t border-[#393E46] pt-2">
						<p class="mb-3 text-sm text-gray-400">Sign in to access more features</p>
						<a
							href="/sign-in"
							class="block rounded-[12px] border border-[#AF3E3E] bg-[#D84040] px-4 py-3 text-center font-medium text-[#ECFAE5] transition-colors hover:bg-[#BF3131]"
							onclick={() => (menu = false)}
						>
							Sign In
						</a>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes slide-in-from-top-2 {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slide-in-from-top-4 {
		from {
			opacity: 0;
			transform: translateY(-1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-in {
		animation-duration: 0.2s;
		animation-fill-mode: both;
	}

	.slide-in-from-top-2 {
		animation-name: slide-in-from-top-2;
	}

	.slide-in-from-top-4 {
		animation-name: slide-in-from-top-4;
	}

	.duration-200 {
		animation-duration: 0.2s;
	}

	.duration-300 {
		animation-duration: 0.3s;
	}

	.ease-out {
		animation-timing-function: ease-out;
	}
</style>
