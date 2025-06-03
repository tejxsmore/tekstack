<script lang="ts">
	const data = $props();
	const { user, author } = data.data;
	let { saved } = $state(data.data);

	import { X, Edit, Trash } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/user';
	import { onDestroy } from 'svelte';

	let deleteDialogRef = $state<HTMLElement | null>(null);
	let editDialogRef = $state<HTMLElement | null>(null);

	$effect(() => {
		if ($userStore == null) {
			console.log("Sign In to access '/user/profile' ");
			goto('/');
		}

		function handleClickOutside(event: MouseEvent) {
			if (deleteDialog && deleteDialogRef && !deleteDialogRef.contains(event.target as Node)) {
				cancelDialog();
			}
			if (editDialog && editDialogRef && !editDialogRef.contains(event.target as Node)) {
				cancelDialog();
			}
		}

		function handleEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				cancelDialog();
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);

		onDestroy(() => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		});
	});

	interface Post {
		slug: string;
		title: string;
		tag: {
			slug: string;
			name: string;
		}[];
		content: string;
	}

	let posts = $state(author?.post || []);
	let deleteDialog = $state(false);
	let editDialog = $state(false);
	let selectedPost = $state<Post | null>(null);
	let tagString = $state('');
	let originalTitle = $state('');

	const links = author
		? [
				{ label: 'Website', url: author.website, src: '/logos/website.png' },
				{ label: 'Instagram', url: author.instagram, src: '/logos/instagram.png' },
				{ label: 'Facebook', url: author.facebook, src: '/logos/facebook.png' },
				{ label: 'LinkedIn', url: author.linkedin, src: '/logos/linkedin.png' }
			].filter((link) => link.url)
		: [];

	function handleDelete(post: any) {
		selectedPost = post;
		deleteDialog = true;
	}

	function handleEdit(post: any) {
		selectedPost = post;
		editDialog = true;
		tagString = selectedPost?.tag.map((tag) => tag.name).join(', ') || '';
		originalTitle = selectedPost?.title!;
	}

	function cancelDialog() {
		deleteDialog = false;
		editDialog = false;
		selectedPost = null;
		tagString = '';
		originalTitle = '';
	}

	function slugify(text: string) {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}
</script>

<svelte:head>
	<title>{author.name || user.name}</title>
</svelte:head>

<div class="min-h-screen space-y-6 p-6">
	{#if !author}
		<div>
			<h1 class="text-2xl font-bold">{user.name}</h1>
			<h2>{user.email}</h2>
		</div>
	{:else}
		<div class="">
			<div class="flex gap-6">
				<div class="h-20 w-20 rounded-full bg-[#393E46]"></div>
				<div class="space-y-3">
					<h1 class="text-4xl font-semibold">{author.name}</h1>
					<h3>{author.title}</h3>
				</div>
			</div>
		</div>

		<div>
			{#if links.length > 0}
				<div class="flex gap-3">
					{#each links as link}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="cursor-pointer rounded-[12px] border border-[#393E46] bg-[#272829] p-2 delay-100 hover:text-[#D84040]"
						>
							<img src={link.src} alt={`Link for ${link.label}`} class="h-5 w-5" />
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<div>
			{#if posts.length > 0}
				<div class="flex flex-col space-y-6">
					<h1>Posts created</h1>
					<div
						class="divide-y divide-[#393E46] overflow-hidden rounded-[20px] border border-[#393E46]"
					>
						{#each posts as post, i (post.slug)}
							<div class="flex items-center justify-between gap-5 bg-[#212121] p-3 px-6 transition">
								<a href={`/blog/${post.slug}`} class="flex gap-3">
									<p>{i + 1}.</p>
									<p class="line-clamp-1">{post.title}</p>
								</a>
								<div class="flex items-center gap-3">
									<button
										type="submit"
										onclick={() => handleEdit(post)}
										class="cursor-pointer rounded-[12px] bg-[#272829] p-2 hover:text-[#D84040] focus:outline-none"
									>
										<Edit size="16" />
									</button>
									<button
										type="submit"
										onclick={() => handleDelete(post)}
										class="cursor-pointer rounded-[12px] bg-[#272829] p-2 hover:text-[#D84040] focus:outline-none"
									>
										<Trash size="16" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		{#if saved.length >= 1}
			<div class="space-y-6">
				<h2>Saved posts</h2>
				<div class="flex gap-6 overflow-x-auto">
					{#each saved as save}
						<div
							class="w-full max-w-[260px] rounded-[16px] border border-[#393E46] bg-[#212121] p-6 sm:max-w-sm"
						>
							<a href={`/blog/${save.postSlug}`}>{save.postTitle}</a>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if deleteDialog && selectedPost}
			<div
				class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#1a1a19]/90 p-6"
			>
				<form
					method="post"
					action="?/delete"
					bind:this={deleteDialogRef}
					use:enhance={() => {
						posts = posts.filter((p: any) => p.slug !== selectedPost?.slug);
						deleteDialog = false;
						selectedPost = null;
						return async ({ result }) => {
							if (result.type === 'error' || result.type === 'failure') {
								posts = [...posts, selectedPost];
							}
						};
					}}
					class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6 sm:max-w-md"
				>
					<input type="hidden" name="slug" value={selectedPost.slug} />
					<div class="flex items-center justify-between">
						<h3 class="text-2xl font-semibold">Confirm delete</h3>
						<button
							type="button"
							onclick={cancelDialog}
							class="cursor-pointer rounded-[12px] bg-[#272829] p-2 delay-100 hover:text-[#D84040]"
							><X size="20" /></button
						>
					</div>
					<div class="space-y-1.5">
						<p>Are you sure you want to delete this post?</p>
						<p class="font-semibold">{selectedPost.title}</p>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<button
							type="button"
							onclick={cancelDialog}
							class="w-full cursor-pointer rounded-[16px] border border-[#393E46] p-3 hover:bg-[#272829]"
							>Cancel</button
						>
						<button
							type="submit"
							class="w-full cursor-pointer rounded-[16px] border border-[#AF3E3E] bg-[#D84040] p-3 font-medium text-[#ECFAE5] hover:bg-[#BF3131]"
							>Delete</button
						>
					</div>
				</form>
			</div>
		{/if}

		{#if editDialog && selectedPost}
			<div
				class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#1a1a19]/90 p-6"
			>
				<form
					method="post"
					action="?/edit"
					bind:this={editDialogRef}
					use:enhance={() => {
						if (selectedPost?.title !== originalTitle) {
							const newSlug = slugify(selectedPost?.title!);

							posts = posts.map((post: any) => {
								if (post.slug === selectedPost?.slug) {
									return {
										...post,
										title: selectedPost?.title,
										slug: newSlug
									};
								}
								return post;
							});

							saved = saved.map((save: any) => {
								if (save.postSlug === selectedPost?.slug) {
									return {
										...save,
										postTitle: selectedPost?.title,
										postSlug: newSlug
									};
								}
								return save;
							});
						}
						editDialog = false;
						tagString = '';
						originalTitle = '';

						return async ({ result }) => {
							if (result.type === 'error' || result.type === 'failure') {
								posts = posts.map((post: any) => {
									if (post.slug === selectedPost?.slug) {
										return {
											...post,
											title: selectedPost?.title,
											slug: selectedPost?.slug
										};
									}
									return post;
								});
							}
							selectedPost = null;
						};
					}}
					class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6 text-sm sm:max-w-4xl"
				>
					<input type="hidden" name="email" value={user.email} />
					<input type="hidden" name="slug" value={selectedPost.slug} />

					<div class="flex items-center justify-between">
						<h3 class="text-2xl font-semibold">Edit Post</h3>
						<button
							type="button"
							onclick={cancelDialog}
							class="cursor-pointer rounded-[12px] bg-[#272829] p-2 delay-100 hover:text-[#D84040]"
							><X size="20" /></button
						>
					</div>

					<div class="flex flex-col">
						<label for="title" class="pb-0.5">Title</label>
						<input
							type="text"
							id="title"
							name="title"
							required
							minlength="10"
							bind:value={selectedPost.title}
							class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
						/>
					</div>

					<div class="flex flex-col">
						<label for="tags" class="pb-0.5">Tags (comma seperated)</label>
						<input
							type="text"
							id="tags"
							name="tags"
							bind:value={tagString}
							class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
						/>
					</div>

					<div class="flex flex-col">
						<label for="content" class="pb-0.5">Content</label>
						<textarea
							name="content"
							id="content"
							rows="10"
							required
							minlength="100"
							bind:value={selectedPost.content}
							class="resize-none rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
						></textarea>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<button
							type="button"
							onclick={cancelDialog}
							class="w-full cursor-pointer rounded-[16px] border border-[#393E46] p-3 hover:bg-[#272829]"
							>Cancel</button
						>
						<button
							type="submit"
							class="w-full cursor-pointer rounded-[12px] border border-[#AF3E3E] bg-[#D84040] p-3 font-medium text-[#ECFAE5] delay-100 hover:bg-[#BF3131]"
							>Submit</button
						>
					</div>
				</form>
			</div>
		{/if}
	{/if}
</div>
