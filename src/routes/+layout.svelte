<!-- layout.svelte -->
<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	const { children, data } = $props();
	const { session } = data;
</script>

<Navbar {session} />
{@render children()}
