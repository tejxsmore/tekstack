<script lang="ts">
	import { signOut } from '$lib/auth-client';

	async function handleSignOut() {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.reload();
				}
			}
		});
	}
</script>

<button
	on:click={handleSignOut}
	class="block w-full cursor-pointer rounded-[12px] bg-[#D84040] p-3 text-[#ECFAE5] transition-colors hover:bg-[#BF3131]"
>
	Sign Out
</button>
