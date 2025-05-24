<script lang="ts">
	const data = $props();
	const { form } = data;

	import SocialAuthButton from '$lib/components/auth/SocialAuthButton.svelte';
</script>

<div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#1a1a19] p-6">
	<div class="w-full rounded-[16px] border border-[#393E46] bg-[#212121] p-6 sm:max-w-sm">
		<div>
			<div class="text-center">
				<div class="pb-6">
					<a href="/" class=" text-4xl font-bold">TEKSTACK</a>
				</div>
				<p class="font-medium">Welcome! Sign in to continue</p>
			</div>

			<div class="mt-6 grid grid-cols-2 gap-3">
				<SocialAuthButton provider="google" type="button">Google</SocialAuthButton>
				<SocialAuthButton provider="github" type="button">Github</SocialAuthButton>
			</div>

			<hr class="my-6 border-[#393E46]" />

			<form method="POST" class="space-y-6">
				<div class="flex flex-col space-y-0.5">
					<label for="email" class="text-sm">Email</label>
					<input
						type="email"
						name="email"
						required
						id="email"
						class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					/>
				</div>

				<div class="flex flex-col space-y-0.5">
					<label for="password" class="text-sm">Password</label>
					<input
						type="password"
						required
						name="password"
						id="password"
						class="rounded-[12px] border border-[#393E46] bg-[#191919] p-3 text-sm ring-[#393E46] focus:ring focus:outline-none"
					/>
				</div>

				<button
					type="submit"
					class="w-full cursor-pointer rounded-[12px] border border-[#AF3E3E] bg-[#D84040] p-3 font-medium text-[#ECFAE5] delay-100 hover:bg-[#BF3131]"
				>
					Sign In
				</button>
			</form>
		</div>
		<div class="mt-6 flex gap-3 text-sm">
			<p>Don't have an account?</p>
			<a href="/sign-up" class="font-semibold hover:text-[#A94A4A] hover:underline">Sign Up</a>
		</div>
		{#if form?.errorMessage}
			<p class="text-[#D84040]">{form.errorMessage}</p>
		{/if}
	</div>
</div>
