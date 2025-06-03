<script lang="ts">
	import { Heart, MessageCircle, Bookmark, Share, X, Check } from '@lucide/svelte';
	import { userStore } from '$lib/stores/user';

	const { post, likes, saves, comments } = $props();
	import { onMount, onDestroy } from 'svelte';

	let modalRef = $state<HTMLElement | null>(null);

	let isLiked = $state(false);
	let likeCount = $state(Array.isArray(likes) ? likes.length : 0);

	let commentCount = $state(Array.isArray(comments) ? comments.length : 0);
	let isSaved = $state(false);

	let modal = $state(false);

	// Tooltip states
	let showLikeTooltip = $state(false);
	let showCommentTooltip = $state(false);
	let showSaveTooltip = $state(false);
	let showShareTooltip = $state(false);
	let urlCopied = $state(false);

	// Track if user just clicked to prevent tooltip on hover after click
	let justClicked = $state({
		like: false,
		save: false,
		share: false
	});

	$effect(() => {
		if ($userStore && Array.isArray(likes)) {
			isLiked = likes.some((like) => like.userId === $userStore.id);
		} else {
			isLiked = false;
		}

		if ($userStore && Array.isArray(saves)) {
			isSaved = saves.some((save) => save.userId === $userStore.id);
		} else {
			isSaved = false;
		}
	});

	const handleLike = async () => {
		// Set click flag and hide tooltip immediately
		justClicked.like = true;
		showLikeTooltip = false;

		// Reset click flag after a short delay
		setTimeout(() => {
			justClicked.like = false;
		}, 300);

		if (!$userStore) {
			modal = true;
			return;
		}

		const prevLiked = isLiked;
		isLiked = !isLiked;
		likeCount += isLiked ? 1 : -1;

		try {
			await fetch(`/api/actions/like`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					postId: post.id,
					action: isLiked ? 'like' : 'unlike'
				})
			});
		} catch (err) {
			isLiked = prevLiked;
			likeCount += isLiked ? 1 : -1;
			console.error('Error updating like:', err);
		}
	};

	const handleSave = async () => {
		// Set click flag and hide tooltip immediately
		justClicked.save = true;
		showSaveTooltip = false;

		// Reset click flag after a short delay
		setTimeout(() => {
			justClicked.save = false;
		}, 300);

		if (!$userStore) {
			modal = true;
			return;
		}

		isSaved = !isSaved;

		try {
			await fetch(`/api/actions/save`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					postId: post.id,
					postTitle: post.title,
					postSlug: post.slug,
					action: isSaved ? 'save' : 'unsave'
				})
			});
		} catch (err) {
			isSaved = !isSaved;
			console.error('Error updating save:', err);
		}
	};

	const handleShare = async () => {
		// Set click flag and hide tooltip immediately
		justClicked.share = true;
		showShareTooltip = false;

		// Reset click flag after a short delay
		setTimeout(() => {
			justClicked.share = false;
		}, 300);

		try {
			const currentUrl = window.location.href;
			await navigator.clipboard.writeText(currentUrl);

			urlCopied = true;
			showShareTooltip = true;

			// Reset after 2 seconds
			setTimeout(() => {
				urlCopied = false;
				showShareTooltip = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy URL:', err);
		}
	};

	const handleTooltipEnter = (tooltip: string) => {
		switch (tooltip) {
			case 'like':
				if (!justClicked.like) {
					showLikeTooltip = true;
				}
				break;
			case 'comment':
				showCommentTooltip = true;
				break;
			case 'save':
				if (!justClicked.save) {
					showSaveTooltip = true;
				}
				break;
			case 'share':
				if (!urlCopied && !justClicked.share) {
					showShareTooltip = true;
				}
				break;
		}
	};

	const handleTooltipLeave = (tooltip: string) => {
		switch (tooltip) {
			case 'like':
				showLikeTooltip = false;
				break;
			case 'comment':
				showCommentTooltip = false;
				break;
			case 'save':
				showSaveTooltip = false;
				break;
			case 'share':
				if (!urlCopied) showShareTooltip = false;
				break;
		}
	};

	$effect(() => {
		if (!modal) return;

		function handleClickOutside(event: MouseEvent) {
			if (modalRef && !modalRef.contains(event.target as Node)) {
				modal = false;
			}
		}

		function handleEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				modal = false;
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

<div class="fixed bottom-10 left-1/2 z-30 -translate-x-1/2 transform">
	<div
		class="flex items-center space-x-3 rounded-full border border-[#393e46] bg-[#212121] p-3 py-1.5"
	>
		<!-- Like -->
		<div class="relative">
			<button
				onclick={handleLike}
				onmouseenter={() => handleTooltipEnter('like')}
				onmouseleave={() => handleTooltipLeave('like')}
				class="group flex cursor-pointer items-center space-x-2 transition-all duration-300 hover:scale-110 focus:outline-none"
			>
				<div
					class={`rounded-full p-2 transition-all duration-300 ${
						isLiked
							? 'bg-red-500/20 text-red-400'
							: 'bg-[#272829] text-gray-400 group-hover:bg-red-500/10 group-hover:text-red-400'
					}`}
				>
					<Heart
						class={`h-5 w-5 transition-all duration-300 ${isLiked ? 'fill-current' : 'group-hover:scale-110'}`}
					/>
				</div>
				<span
					class={`text-sm font-medium transition-colors duration-300 ${
						isLiked ? 'text-red-400' : 'text-gray-400 group-hover:text-red-400'
					}`}
				>
					{likeCount}
				</span>
			</button>

			{#if showLikeTooltip}
				<div class="absolute bottom-full left-1/2 mb-4 -translate-x-1/2 transform">
					<div
						class="rounded-[12px] border border-[#393E46] bg-[#272829] px-3 py-1.5 text-sm whitespace-nowrap text-white shadow-lg"
					>
						{$userStore ? (isLiked ? 'Unlike' : 'Like') : 'Sign in to like'}
					</div>
				</div>
			{/if}
		</div>

		<!-- Comment -->
		<div class="relative">
			<a
				href="#comments"
				onmouseenter={() => handleTooltipEnter('comment')}
				onmouseleave={() => handleTooltipLeave('comment')}
				class="group flex cursor-pointer items-center space-x-2 transition-all duration-300 hover:scale-110 focus:outline-none"
			>
				<div
					class="rounded-full bg-[#272829] p-2 text-gray-400 transition-all duration-300 group-hover:bg-blue-500/10 group-hover:text-blue-400"
				>
					<MessageCircle class="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
				</div>
				<span
					class="text-sm font-medium text-gray-400 transition-colors duration-300 group-hover:text-blue-400"
				>
					{commentCount}
				</span>
			</a>

			{#if showCommentTooltip}
				<div class="absolute bottom-full left-1/2 mb-4 -translate-x-1/2 transform">
					<div
						class="rounded-[12px] border border-[#393E46] bg-[#272829] px-3 py-1.5 text-sm whitespace-nowrap text-white shadow-lg"
					>
						Comment
					</div>
				</div>
			{/if}
		</div>

		<!-- Save -->
		<div class="relative">
			<button
				onclick={handleSave}
				onmouseenter={() => handleTooltipEnter('save')}
				onmouseleave={() => handleTooltipLeave('save')}
				class="group mt-[5px] cursor-pointer transition-all duration-300 hover:scale-110 focus:outline-none"
			>
				<div
					class={`rounded-full p-2 transition-all duration-300 ${
						isSaved
							? 'bg-yellow-500/20 text-yellow-400'
							: 'bg-[#272829] text-gray-400 group-hover:bg-yellow-500/10 group-hover:text-yellow-400'
					}`}
				>
					<Bookmark
						class={`h-5 w-5 transition-all duration-300 ${isSaved ? 'fill-current' : 'group-hover:scale-110'}`}
					/>
				</div>
			</button>

			{#if showSaveTooltip}
				<div class="absolute bottom-full left-1/2 mb-2.75 -translate-x-1/2 transform">
					<div
						class="rounded-[12px] border border-[#393E46] bg-[#272829] px-3 py-1.5 text-sm whitespace-nowrap text-white shadow-lg"
					>
						{$userStore ? (isSaved ? 'Unsave' : 'Save') : 'Sign in to save'}
					</div>
				</div>
			{/if}
		</div>

		<!-- Share -->
		<div class="relative">
			<button
				onclick={handleShare}
				onmouseenter={() => handleTooltipEnter('share')}
				onmouseleave={() => handleTooltipLeave('share')}
				class="group mt-[5px] cursor-pointer transition-all duration-300 hover:scale-110 focus:outline-none"
			>
				<div
					class="rounded-full bg-[#272829] p-2 text-gray-400 transition-all duration-300 group-hover:bg-green-500/10 group-hover:text-green-400"
				>
					<Share class="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
				</div>
			</button>

			{#if showShareTooltip}
				<div class="absolute bottom-full left-1/2 mb-2.75 -translate-x-1/2 transform">
					<div
						class={`rounded-[12px] border px-3 py-1.5 text-sm whitespace-nowrap shadow-lg ${
							urlCopied
								? 'border-[#15803d] bg-[#14532d] text-[#86efac]'
								: 'border-[#393E46] bg-[#272829] text-white'
						}`}
					>
						{#if urlCopied}
							<div class="flex items-center gap-1.5">
								<Check size="14" />
								URL copied
							</div>
						{:else}
							Share
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

{#if modal}
	<div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#1a1a19]/90 p-6">
		<div
			bind:this={modalRef}
			class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6 sm:max-w-md"
		>
			<div class="flex items-center justify-between">
				<h3 class="text-2xl font-semibold">Sign In</h3>
				<button
					type="button"
					onclick={() => (modal = false)}
					class="cursor-pointer rounded-[12px] bg-[#272829] p-2 delay-100 hover:text-[#D84040]"
				>
					<X size="20" />
				</button>
			</div>

			<p>You need to be signed in to like, comment and save posts.</p>

			<a href="/sign-in">
				<div
					class="w-full cursor-pointer rounded-[16px] border border-[#AF3E3E] bg-[#D84040] p-3 text-center font-medium text-[#ECFAE5] hover:bg-[#BF3131]"
				>
					Sign In
				</div>
			</a>
		</div>
	</div>
{/if}
