<script lang="ts">
	import { signIn } from '$lib/auth-client';
	import type { Snippet } from 'svelte';

	let {
		children,
		provider,
		type,
		callbackURL = '/'
	}: {
		children: Snippet;
		provider: 'google' | 'github';
		type: 'button';
		callbackURL?: string;
	} = $props();

	const providerLogo = $derived(provider === 'google' ? '/logos/google.png' : '/logos/github.png');
</script>

<button
	class="flex cursor-pointer items-center justify-center gap-3 rounded-[12px] border border-[#393E46] bg-[#212121] p-1.5 text-sm delay-100 hover:bg-[#272829]"
	onclick={async () => {
		await signIn.social({
			provider,
			callbackURL
		});
	}}
>
	<img src={providerLogo} alt={`${provider} logo`} class="h-4 w-4" />
	{@render children()}
</button>
