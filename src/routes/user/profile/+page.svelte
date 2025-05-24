<script lang="ts">
	import { enhance } from '$app/forms';
	const data = $props();
	const { user, author } = data.data;

	import { Edit, Trash } from '@lucide/svelte';

	let posts = $state(author?.post || []);

	const links = author
		? [
				{ label: 'Website', url: author.website },
				{ label: 'Instagram', url: author.instagram },
				{ label: 'Facebook', url: author.facebook },
				{ label: 'LinkedIn', url: author.linkedin }
			].filter((link) => link.url)
		: [];
</script>

<div class="space-y-6 p-6">
	<h1>Dashboard</h1>
	{#if !author}
		<div>
			<h1 class="text-2xl font-bold">{user.name}</h1>
			<h2>{user.email}</h2>
		</div>
	{:else}
		<div>
			<h1 class="text-2xl font-bold">{author.name}</h1>
			<h2>{author.email}</h2>
			<h3>{author.title}</h3>
			<p>{author.bio}</p>
		</div>

		<div>
			{#if links.length > 0}
				<div class="flex flex-col">
					<h1>Links</h1>
					{#each links as link}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-600 hover:underline"
						>
							{link.label}
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<div>
			{#if posts.length > 0}
				<div class="flex flex-col">
					<h1>Posts created</h1>
					{#each posts as post (post.slug)}
						<div class="flex items-center gap-6">
							<a href={post.slug} class="border p-2">{post.title}</a>
							<form method="post">
								<input type="hidden" name="slug" value={post.slug} />
								<button type="submit" formaction="?/edit">
									<Edit class="cursor-pointer" />
								</button>
							</form>
							<form
								method="post"
								use:enhance={() => {
									posts = posts.filter((p: any) => p.slug !== post.slug);
									return async ({ result }) => {
										if (result.type === 'error' || result.type === 'failure') {
											posts = [...posts, post];
										}
									};
								}}
							>
								<input type="hidden" name="slug" value={post.slug} />
								<button type="submit" formaction="?/delete">
									<Trash class="cursor-pointer" />
								</button>
							</form>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
