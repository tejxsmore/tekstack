<script>
	const { data } = $props();
	const { user, author } = data;

	let markdown = $state('');
</script>

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

				<h2 class="text-center text-2xl font-semibold">Links</h2>
				<div class="space-y-6">
					<div class="flex flex-col">
						<label for="website" class="pb-0.5">Personal website URL</label>
						<input
							type="url"
							id="website"
							name="website"
							placeholder="https://mywebsite.com"
							class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
						/>
					</div>
					<div class="flex flex-col">
						<label for="instagram" class="pb-0.5">Instagram</label>
						<input
							type="text"
							id="instagram"
							name="instagram"
							placeholder="Username"
							class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
						/>
					</div>
					<div class="flex flex-col">
						<label for="instagram" class="pb-0.5">Facebook</label>
						<input
							type="text"
							id="facebook"
							name="facebook"
							placeholder="Username"
							class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
						/>
					</div>
					<div class="flex flex-col">
						<label for="linkedin" class="pb-0.5">LinkedIn</label>
						<input
							type="text"
							id="linkedin"
							name="linkedin"
							placeholder="Username"
							class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
						/>
					</div>
				</div>
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
						placeholder="Astro JS in 2025"
						class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					/>
				</div>
				<div class="flex flex-col">
					<label for="title" class="pb-0.5">Tags (comma seperated)</label>
					<input
						type="text"
						id="tags"
						name="tags"
						required
						placeholder="Astro,  Web development"
						class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					/>
				</div>
				<div class="flex flex-col">
					<label for="content" class="pb-0.5">Content</label>
					<textarea
						name="content"
						id="content"
						rows="15"
						required
						bind:value={markdown}
						class="resize-none rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					></textarea>
				</div>

				{#if markdown}
					<p>{markdown}</p>
				{/if}

				<button
					type="submit"
					class="w-full cursor-pointer rounded-[12px] border border-[#AF3E3E] bg-[#D84040] p-3 font-medium text-[#ECFAE5] delay-100 hover:bg-[#BF3131]"
					>Submit</button
				>
			</form>
		</div>
	{/if}
</div>
