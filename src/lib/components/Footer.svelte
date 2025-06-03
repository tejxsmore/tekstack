<script lang="ts">
	let email = $state('');
	let isSubscribed = $state(false);
	let isLoading = $state(false);

	const handleNewsletterSubmit = async (e: Event) => {
		e.preventDefault();
		if (!email) return;

		isLoading = true;

		try {
			const res = await fetch('/api/actions/newsletter', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});

			if (!res.ok) {
				throw new Error('Failed to subscribe');
			}

			isSubscribed = true;
			email = '';
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
	};

	const currentYear = new Date().getFullYear();

	const navigationLinks = {
		tools: [{ name: 'All Tools', href: '/' }],
		blog: [{ name: 'All Blogs', href: '/blog' }],
		company: [
			{ name: 'About Us', href: '/about' },
			{ name: 'Careers', href: '/careers' }
		],
		support: [
			{ name: 'Help Center', href: '/help' },
			{ name: 'Submit Software', href: '/tool/submit' },
			{ name: 'Advertise', href: '/tool/submit' }
		]
	};
</script>

<footer class="border-t border-[#393E46] bg-[#212121]">
	<div class="p-6 pt-12">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-6 lg:gap-30">
			<div class="lg:col-span-2">
				<div class="mb-6">
					<h3 class="mb-2 text-2xl font-bold text-white">Tekstack</h3>
					<p class="text-sm leading-relaxed text-gray-400">
						Your trusted source for comprehensive software reviews, industry insights, and tech
						tutorials. Helping businesses and individuals make informed software decisions since
						2020.
					</p>
				</div>

				<div class="mb-6">
					<h4 class="mb-3 text-lg font-semibold">Stay Updated</h4>
					{#if isSubscribed}
						<div class="rounded-[16px] border border-green-700 bg-green-900/30 p-4">
							<p class="text-sm text-green-400">✓ Successfully subscribed to our newsletter!</p>
						</div>
					{:else}
						<form onsubmit={handleNewsletterSubmit} class="space-y-3">
							<div class="relative">
								<input
									type="email"
									bind:value={email}
									name="email"
									placeholder="Enter your email"
									required
									class="w-full rounded-[16px] border border-[#393E46] bg-[#272829] p-3 placeholder-gray-400 ring-[#393E46] transition-colors focus:ring-2 focus:outline-none"
								/>
							</div>
							<button
								type="submit"
								disabled={isLoading}
								class="w-full cursor-pointer rounded-[16px] border-[#4E71FF] bg-[#3A59D1] p-3 font-medium text-white transition-colors duration-200 hover:bg-[#362FD9] disabled:cursor-not-allowed disabled:bg-blue-800"
							>
								{#if isLoading}
									<span class="flex items-center justify-center">
										<svg
											class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Subscribing...
									</span>
								{:else}
									Subscribe to Newsletter
								{/if}
							</button>
						</form>
					{/if}
					<p class="mt-2 text-xs text-gray-500">
						Weekly digest of the latest software reviews and tech insights. We won't send you spam
						emails, promise.
					</p>
				</div>
			</div>

			<!-- Navigation Links -->
			<div class="grid grid-cols-2 gap-8 md:grid-cols-4 lg:col-span-4">
				<!-- Reviews Section -->
				<div>
					<h4 class="mb-4 text-lg font-semibold text-white">Tools</h4>
					<ul class="space-y-2">
						{#each navigationLinks.tools as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
								>
									{link.name}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Blog Section -->
				<div>
					<h4 class="mb-4 text-lg font-semibold text-white">Blog</h4>
					<ul class="space-y-2">
						{#each navigationLinks.blog as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
								>
									{link.name}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Company Section -->
				<div>
					<h4 class="mb-4 text-lg font-semibold text-white">Company</h4>
					<ul class="space-y-2">
						{#each navigationLinks.company as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
								>
									{link.name}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Support Section -->
				<div>
					<h4 class="mb-4 text-lg font-semibold text-white">Support</h4>
					<ul class="space-y-2">
						{#each navigationLinks.support as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
								>
									{link.name}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Footer -->
	<div class="border-t border-[#393E46] bg-[#1a1a19]">
		<div class="mx-auto p-6">
			<div class="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
				<div class="text-sm text-gray-400">
					© {currentYear} TEKSTACK. All rights reserved.
				</div>

				<div class="flex flex-wrap justify-center space-x-6 text-sm md:justify-end">
					<a href="/privacy" class="text-gray-400 transition-colors duration-200 hover:text-white">
						Privacy Policy
					</a>
					<a href="/terms" class="text-gray-400 transition-colors duration-200 hover:text-white">
						Terms of Service
					</a>
				</div>
			</div>
		</div>
	</div>
</footer>
