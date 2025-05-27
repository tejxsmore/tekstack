<script lang="ts">
	import { signOut } from '$lib/auth-client';
	import { userStore } from '$lib/stores/user';

	async function handleSignOut() {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					$userStore = null;
				}
			}
		});
	}
</script>

<button
	onclick={handleSignOut}
	class="block w-full cursor-pointer rounded-[12px] border border-[#AF3E3E] bg-[#D84040] p-3 font-medium text-[#ECFAE5] delay-100 hover:bg-[#BF3131]"
>
	Sign Out
</button>
