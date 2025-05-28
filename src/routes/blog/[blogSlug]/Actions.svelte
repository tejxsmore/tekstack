<script lang="ts">
	import { Heart, MessageCircle, Bookmark, Share, X } from '@lucide/svelte';

	const { post, userStore, liked, saved } = $props();

	let isLiked = $state(false);
	let likeCount = $state(Array.isArray(liked) ? liked.length : 0);

	let isSaved = $state(false);
	let modal = $state(false);

	$effect(() => {
		if ($userStore && Array.isArray(liked)) {
			isLiked = liked.some((like) => like.userId === $userStore.id);
		} else {
			isLiked = false;
		}

		if ($userStore && Array.isArray(saved)) {
			isSaved = saved.some((save) => save.userId === $userStore.id);
		} else {
			isSaved = false;
		}
	});

	const handleLike = async () => {
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

	const handleComment = () => {
		if (!$userStore) {
			modal = true;
		} else {
			console.log(`COMMENTED: ${post.title}`);
		}
	};

	const handleShare = () => {
		console.log(`SHARED: ${post.title}`);
	};
</script>

<div class="fixed bottom-10 left-1/2 z-30 -translate-x-1/2 transform">
	<div class="flex items-center space-x-6 rounded-full border border-[#393e46] bg-[#212121] p-3">
		<!-- Like -->
		<button
			onclick={handleLike}
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

		<!-- Comment -->
		<button
			onclick={handleComment}
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
				{post.comments || 12}
			</span>
		</button>

		<!-- Save -->
		<button
			onclick={handleSave}
			class="group cursor-pointer transition-all duration-300 hover:scale-110 focus:outline-none"
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

		<!-- Share -->
		<button
			onclick={handleShare}
			class="group cursor-pointer transition-all duration-300 hover:scale-110 focus:outline-none"
		>
			<div
				class="rounded-full bg-[#272829] p-2 text-gray-400 transition-all duration-300 group-hover:bg-green-500/10 group-hover:text-green-400"
			>
				<Share class="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
			</div>
		</button>
	</div>
</div>

{#if modal}
	<div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#1a1a19] p-6">
		<div
			class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6 sm:max-w-md"
		>
			<div class="flex items-center justify-between">
				<h3 class="text-2xl font-semibold">Sign In</h3>
				<button
					type="button"
					onclick={() => (modal = false)}
					class="cursor-pointer rounded-[12px] border border-[#393E46] bg-[#272829] p-2 delay-100 hover:text-[#D84040]"
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
