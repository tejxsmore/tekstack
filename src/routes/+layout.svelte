<!-- layout.svelte -->
<script lang="ts">
	import '../app.css';
	const { children, data } = $props();

	import Navbar from '$lib/components/Navbar.svelte';
	import { userStore } from '$lib/stores/user';

	$userStore = data.user!;
</script>

<Navbar />
{@render children()}
