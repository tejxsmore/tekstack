<script lang="ts">
	const { post } = $props();

	function formatDate(isoDate: string): string {
		try {
			const date = new Date(isoDate);
			if (isNaN(date.getTime())) return 'Invalid date';

			const months = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			];

			const day = String(date.getDate()).padStart(2, '0');
			const month = months[date.getMonth()];
			const year = date.getFullYear();

			return `${day} ${month}, ${year}`;
		} catch {
			return 'Invalid date';
		}
	}
</script>

<div class="flex flex-col justify-end rounded-[16px] border border-[#393E46] bg-[#212121] p-6">
	<a href={`/blog/${post.slug}`} class="flex flex-grow">{post.title}</a>

	<div class="flex items-center gap-3 pt-6">
		<a href={`/blog/author/${post.author?.slug}`} class="text-[#3D90D7] hover:text-[#3A59D1]">
			{post.author?.name}
		</a>
		<span> • </span>
		<p class="text-sm">{formatDate(post.createdAt)}</p>
	</div>
</div>
