<script lang="ts">
	const { data } = $props();
	const { user, author } = data;

	import { ChevronDown } from '@lucide/svelte';

	let markdown = $state('');
	let links = $state(false);
</script>

<svelte:head>
	<title>Write Blog</title>
</svelte:head>

<div class="flex items-center justify-center p-6">
	{#if !author}
		<div
			class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6 sm:max-w-4xl"
		>
			<h1 class="text-center text-2xl font-semibold">Register as author</h1>
			<form method="post" action="?/register" class="space-y-6 text-sm">
				<input type="hidden" name="email" value={user.email} />

				<div class="flex flex-col">
					<label for="name" class="pb-0.5">Name</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						placeholder="John Doe"
						class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					/>
				</div>
				<div class="flex flex-col">
					<label for="title" class="pb-0.5">Title</label>
					<input
						type="text"
						id="title"
						name="title"
						required
						placeholder="Author"
						class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					/>
				</div>
				<div class="flex flex-col">
					<label for="bio" class="pb-0.5">Bio</label>
					<textarea
						name="bio"
						id="bio"
						rows="3"
						required
						placeholder="Software engineer from Mumbai"
						class="resize-none rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					></textarea>
				</div>

				<hr class="text-[#393E46]" />

				<div class="flex items-center justify-between">
					<button type="button" onclick={() => (links = !links)} class="text-lg font-medium">
						Add Links <span class="text-gray-500">(optional)</span>
					</button>
					<button
						type="button"
						onclick={() => (links = !links)}
						class="cursor-pointer rounded-[12px] border border-[#393E46] bg-[#212121] p-2 transition-colors hover:bg-[#272829] focus:outline-none"
					>
						<ChevronDown
							size="20"
							class="transition-transform duration-300 ease-in-out {links ? 'rotate-180' : ''}"
						/>
					</button>
				</div>
				{#if links}
					<div class="grid gap-6 sm:grid-cols-2">
						<div class="flex items-center gap-3">
							<img src="/logos/website.png" alt="Website logo" class="h-9 w-9" />
							<input
								type="url"
								id="website"
								name="website"
								placeholder="https://mywebsite.com"
								class="w-full rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
							/>
						</div>
						<div class="flex items-center gap-3">
							<img src="/logos/instagram.png" alt="Instagram logo" class="h-9 w-9" />

							<input
								type="text"
								id="instagram"
								name="instagram"
								placeholder="Username"
								class="w-full rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
							/>
						</div>
						<div class="flex items-center gap-3">
							<img src="/logos/facebook.png" alt="Facebook logo" class="h-9 w-9" />
							<input
								type="text"
								id="facebook"
								name="facebook"
								placeholder="Username"
								class="w-full rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
							/>
						</div>
						<div class="flex items-center gap-3">
							<img src="/logos/linkedin.png" alt="Instagram logo" class="h-9 w-9" />
							<input
								type="text"
								id="linkedin"
								name="linkedin"
								placeholder="Username"
								class="w-full rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
							/>
						</div>
					</div>
				{/if}
				<button
					type="submit"
					class="w-full cursor-pointer rounded-[12px] border border-[#AF3E3E] bg-[#D84040] p-3 font-medium text-[#ECFAE5] delay-100 hover:bg-[#BF3131]"
					>Register</button
				>
			</form>
		</div>
	{:else}
		<div
			class="w-full space-y-6 rounded-[16px] border border-[#393E46] bg-[#212121] p-6 sm:max-w-4xl"
		>
			<h1 class="text-center text-2xl font-semibold">Write Blog</h1>
			<form method="post" action="?/write" class="space-y-6 text-sm">
				<input type="hidden" name="email" value={user.email} />

				<div class="flex flex-col">
					<label for="title" class="pb-0.5">Title</label>
					<input
						type="text"
						id="title"
						name="title"
						required
						minlength="10"
						placeholder="Astro JS in 2025"
						class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					/>
				</div>
				<div class="flex flex-col">
					<label for="tags" class="pb-0.5">Tags (comma seperated)</label>
					<input
						type="text"
						id="tags"
						name="tags"
						placeholder="Astro,  Web development"
						class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					/>
				</div>

				<div class="flex flex-col">
					<label for="content" class="pb-0.5">Content</label>
					<textarea
						name="content"
						rows="15"
						required
						minlength="100"
						bind:value={markdown}
						class="resize-none rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					></textarea>
				</div>

				<button
					type="submit"
					class="w-full cursor-pointer rounded-[12px] border border-[#AF3E3E] bg-[#D84040] p-3 font-medium text-[#ECFAE5] delay-100 hover:bg-[#BF3131]"
					>Submit</button
				>
			</form>
		</div>
	{/if}
</div>
