<script lang="ts">
	const { data } = $props();
	const { post, likes, saves, comments } = data;

	let activeReplyId = $state<string | null>(null);
	let visibleReplies = $state<Record<string, boolean>>({});
	let commentText = $state('');
	let replyTexts = $state<Record<string, string>>({});
	let isSubmitting = $state(false);
	let isSubmittingReply = $state<Record<string, boolean>>({});
	let showCommentTooltip = $state(false);
	let showReplyTooltips = $state<Record<string, boolean>>({});

	import MarkdownParser from '$lib/components/MarkdownParser.svelte';
	import Actions from './Actions.svelte';
	import { userStore } from '$lib/stores/user';
	import { CornerDownRight } from '@lucide/svelte';

	function formatDate(isoDate: string): string {
		try {
			const date = new Date(isoDate);
			if (isNaN(date.getTime())) return 'Invalid date';

			const months = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			];

			const day = String(date.getDate()).padStart(2, '0');
			const month = months[date.getMonth()];
			const year = date.getFullYear();

			return `${day} ${month}, ${year}`;
		} catch {
			return 'Invalid date';
		}
	}

	const handleComment = async (event: Event) => {
		event.preventDefault();

		if (!commentText.trim() || commentText.length < 10) {
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch(`/api/actions/comment`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					postId: post?.id,
					comment: commentText.trim()
				})
			});

			if (response.ok) {
				commentText = '';
				window.location.reload();
			} else {
				console.error('Failed to submit comment:', await response.text());
			}
		} catch (err) {
			console.error('Failed to submit comment:', err);
		} finally {
			isSubmitting = false;
		}
	};

	const handleReply = async (event: Event, parentCommentId: string) => {
		event.preventDefault();

		const replyText = replyTexts[parentCommentId];
		if (!replyText?.trim() || replyText.length < 10) {
			return;
		}

		isSubmittingReply[parentCommentId] = true;

		try {
			const response = await fetch(`/api/actions/reply`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					postId: post?.id,
					parentCommentId: parentCommentId,
					comment: replyText.trim()
				})
			});

			if (response.ok) {
				replyTexts[parentCommentId] = '';
				activeReplyId = null;
				window.location.reload();
			} else {
				console.error('Failed to submit reply:', await response.text());
			}
		} catch (err) {
			console.error('Failed to submit reply:', err);
		} finally {
			isSubmittingReply[parentCommentId] = false;
		}
	};

	const toggleReply = (commentId: string) => {
		if (activeReplyId === commentId) {
			activeReplyId = null;
		} else {
			activeReplyId = commentId;
			if (!replyTexts[commentId]) {
				replyTexts[commentId] = '';
			}
		}
	};

	// Fixed: Use the comment's own ID for visibility tracking
	const toggleRepliesVisibility = (commentId: string) => {
		visibleReplies[commentId] = !visibleReplies[commentId];
	};

	// Get direct replies for a specific comment
	const getDirectReplies = (commentId: string) => {
		return comments?.filter((c) => c.parentCommentId === commentId) || [];
	};

	// Get top-level comments (no parent)
	const getTopLevelComments = () => {
		return (
			comments?.filter((c) => c.parentCommentId === null || c.parentCommentId === undefined) || []
		);
	};

	// Get only direct reply count (not nested)
	const getDirectReplyCount = (commentId: string): number => {
		return getDirectReplies(commentId).length;
	};

	// Get all nested reply counts for a comment (including replies to replies)
	const getTotalReplyCount = (commentId: string): number => {
		const directReplies = getDirectReplies(commentId);
		let count = directReplies.length;

		// Recursively count replies to replies
		for (const reply of directReplies) {
			count += getTotalReplyCount(reply.id);
		}

		return count;
	};
</script>

<svelte:head>
	<title>{post?.title}</title>
</svelte:head>

<div class="flex items-center justify-center p-6">
	{#if post}
		<div class="w-full space-y-12 sm:max-w-4xl">
			<h1 class="pt-6 text-center text-3xl font-black md:text-6xl">{post.title}</h1>

			<div class="flex items-center justify-center gap-3 text-lg font-normal">
				<a href={`/blog/author/${post.author?.slug}`} class="">{post.author?.name}</a>
				<span> • </span>
				<p>{formatDate(post.createdAt)}</p>
			</div>

			<div class="flex flex-wrap justify-center gap-3">
				{#each post.tag as tag}
					<a
						href={`/blog/tag/${tag.slug}`}
						class="cursor-pointer rounded-[16px] border border-[#4E71FF] bg-[#3A59D1] p-3 px-6 text-center delay-100 hover:bg-[#362FD9] focus:outline-none"
						>#{tag.name}</a
					>
				{/each}
			</div>

			<div class="pt-6">
				<MarkdownParser content={post.content} />
			</div>

			<div id="comments" class="space-y-6 py-6">
				<form onsubmit={handleComment} class="flex gap-3 rounded-[16px]">
					<input
						type="text"
						id="comment"
						name="comment"
						bind:value={commentText}
						required
						placeholder="Write comment"
						disabled={isSubmitting}
						class="w-full rounded-[16px] border border-[#393E46] bg-[#191919] p-3 ring-[#393E46] focus:ring focus:outline-none disabled:opacity-50"
					/>

					<div class="relative">
						<button
							type="submit"
							disabled={isSubmitting || $userStore == null}
							onmouseenter={() => {
								if ($userStore == null) showCommentTooltip = true;
							}}
							onmouseleave={() => (showCommentTooltip = false)}
							class="cursor-pointer rounded-[16px] border border-[#4E71FF] bg-[#3A59D1] px-6 py-3 hover:bg-[#362FD9] disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? 'Commenting...' : 'Comment'}
						</button>

						{#if showCommentTooltip && $userStore == null}
							<div class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform">
								<div
									class="rounded-[12px] border border-[#393E46] bg-[#272829] px-3 py-1.5 text-sm whitespace-nowrap text-white shadow-lg"
								>
									Sign In
								</div>
							</div>
						{/if}
					</div>
				</form>

				{#if comments}
					<div class="space-y-6">
						{#each getTopLevelComments() as topComment}
							<div class="space-y-4">
								<!-- Top level comment -->
								<div class="flex items-start gap-3">
									<div
										class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#272829] font-bold text-[#393E46]"
									>
										{topComment.userFullName?.charAt(0)}
									</div>
									<div class="w-full space-y-1.5">
										<h4 class="font-semibold">{topComment.userFullName}</h4>
										<p class="">{topComment.content}</p>

										<div class="flex gap-3 text-xs">
											<p class="text-gray-400">{formatDate(topComment.createdAt.toISOString())}</p>
											<button
												onclick={() => toggleReply(topComment.id)}
												class="cursor-pointer hover:text-[#4E71FF]">Reply</button
											>
										</div>

										{#if activeReplyId === topComment.id}
											<form
												onsubmit={(e) => handleReply(e, topComment.id)}
												class="flex w-full gap-3 text-sm"
											>
												<input
													type="text"
													name="reply"
													bind:value={replyTexts[topComment.id]}
													required
													placeholder="Write reply"
													disabled={isSubmittingReply[topComment.id]}
													class="w-full rounded-[12px] border border-[#393E46] bg-[#191919] p-3 py-1.5 ring-[#393E46] focus:ring focus:outline-none disabled:opacity-50"
												/>
												<div class="relative">
													<button
														type="submit"
														disabled={isSubmittingReply[topComment.id] || $userStore == null}
														onmouseenter={() => {
															if ($userStore == null) showReplyTooltips[topComment.id] = true;
														}}
														onmouseleave={() => (showReplyTooltips[topComment.id] = false)}
														class="cursor-pointer rounded-[12px] border border-[#4E71FF] bg-[#3A59D1] px-3 py-1.5 hover:bg-[#362FD9] disabled:cursor-not-allowed disabled:opacity-50"
													>
														{isSubmittingReply[topComment.id] ? 'Replying...' : 'Reply'}
													</button>

													{#if showReplyTooltips[topComment.id] && $userStore == null}
														<div
															class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform"
														>
															<div
																class="rounded-[12px] border border-[#393E46] bg-[#272829] px-3 py-1.5 text-sm whitespace-nowrap text-white shadow-lg"
															>
																Sign In
															</div>
														</div>
													{/if}
												</div>
											</form>
										{/if}

										{#if getDirectReplyCount(topComment.id) > 0}
											<button
												onclick={() => toggleRepliesVisibility(topComment.id)}
												class="flex cursor-pointer gap-1.5 text-sm text-[#4E71FF] hover:text-[#3A59D1]"
											>
												<span><CornerDownRight size="16" /></span>
												{visibleReplies[topComment.id]
													? 'Hide replies'
													: `${getDirectReplyCount(topComment.id)} ${getDirectReplyCount(topComment.id) === 1 ? 'Reply' : 'Replies'}`}
											</button>
										{/if}
									</div>
								</div>

								<!-- Direct replies only -->
								{#if visibleReplies[topComment.id]}
									{@render renderNestedComments(getDirectReplies(topComment.id), 1)}
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<Actions {post} {likes} {saves} {comments} />
	{:else}
		<p>No post found</p>
	{/if}
</div>

{#snippet renderNestedComments(comments: any, depth: any)}
	<div class="ml-6 space-y-3 border-l-2 border-[#393E46] pl-6">
		{#each comments as comment}
			<div class="space-y-3">
				<div class="flex items-start gap-3">
					<div
						class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#272829] text-xs font-bold text-[#393E46]"
					>
						{comment.userFullName?.charAt(0)}
					</div>
					<div class="w-full space-y-1">
						<h4 class="text-sm font-semibold">{comment.userFullName}</h4>
						<p class="text-sm">{comment.content}</p>
						<div class="flex gap-3 text-xs">
							<p class="text-gray-400">{formatDate(comment.createdAt.toISOString())}</p>
							{#if depth < 5}
								<button
									onclick={() => toggleReply(comment.id)}
									class="cursor-pointer hover:text-[#4E71FF]">Reply</button
								>
							{/if}
						</div>

						{#if activeReplyId === comment.id}
							<form onsubmit={(e) => handleReply(e, comment.id)} class="flex w-full gap-2 text-sm">
								<input
									type="text"
									name="reply"
									bind:value={replyTexts[comment.id]}
									required
									placeholder="Write reply"
									disabled={isSubmittingReply[comment.id]}
									class="w-full rounded-[8px] border border-[#393E46] bg-[#191919] px-3 py-1.5 text-xs ring-[#393E46] focus:ring focus:outline-none disabled:opacity-50"
								/>
								<div class="relative">
									<button
										type="submit"
										disabled={isSubmittingReply[comment.id] || $userStore == null}
										onmouseenter={() => {
											if ($userStore == null) showReplyTooltips[comment.id] = true;
										}}
										onmouseleave={() => (showReplyTooltips[comment.id] = false)}
										class="cursor-pointer rounded-[8px] border border-[#4E71FF] bg-[#3A59D1] px-3 py-1.5 text-xs hover:bg-[#362FD9] disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isSubmittingReply[comment.id] ? '...' : 'Reply'}
									</button>

									{#if showReplyTooltips[comment.id] && $userStore == null}
										<div class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform">
											<div
												class="rounded-[8px] border border-[#393E46] bg-[#272829] px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg"
											>
												Sign In
											</div>
										</div>
									{/if}
								</div>
							</form>
						{/if}

						<!-- Show replies button for this specific comment -->
						{#if getDirectReplyCount(comment.id) > 0}
							<button
								onclick={() => toggleRepliesVisibility(comment.id)}
								class="flex cursor-pointer gap-1.5 text-xs text-[#4E71FF] hover:text-[#3A59D1]"
							>
								<span><CornerDownRight size="14" /></span>
								{visibleReplies[comment.id]
									? 'Hide replies'
									: `${getDirectReplyCount(comment.id)} ${getDirectReplyCount(comment.id) === 1 ? 'Reply' : 'Replies'}`}
							</button>
						{/if}
					</div>
				</div>

				<!-- Show this comment's direct replies only if toggled -->
				{#if visibleReplies[comment.id] && getDirectReplies(comment.id).length > 0 && depth < 5}
					{@render renderNestedComments(getDirectReplies(comment.id), depth + 1)}
				{:else if getDirectReplies(comment.id).length > 0 && depth >= 5}
					<div class="pl-3 text-xs text-gray-400 italic">
						Max nesting depth reached. {getDirectReplies(comment.id).length} more replies...
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/snippet}
