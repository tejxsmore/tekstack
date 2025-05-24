import { auth } from '$lib/auth';
import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions } from '@sveltejs/kit';

interface Author {
	id: string;
	name: string;
	slug: string;
	email: string;
	title: string;
	bio: string;
	post: {
		title: string;
		slug: string;
	}[];
	website: string;
	instagram: string;
	facebook: string;
	linkedin: string;
}

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		redirect(302, '/sign-in');
	}

	const query = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `
					{
						authors {
							id
							name
							slug
							email
							title
							bio
							post{
								title
								slug
							}
							website
							instagram
							facebook
							linkedin
						}
					}
				`
		})
	};

	const response = await fetch(env.HYGRAPH_API, query);
	const json = await response.json();
	const author: Author | undefined = json?.data?.authors?.find(
		(a: Author) => a.email === session.user.email
	);

	return {
		session,
		user: session?.user || null,
		author
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const slug = formData.get('slug') as string;

		if (!slug) return fail(400, { message: 'Slug is required' });

		try {
			const HYGRAPH_API = env.HYGRAPH_API;
			const HYGRAPH_MUTATION_TOKEN = env.HYGRAPH_MUTATION_TOKEN;

			// 1. Find post ID
			const getPost = await fetch(HYGRAPH_API, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${HYGRAPH_MUTATION_TOKEN}`
				},
				body: JSON.stringify({
					query: `
						query GetPostBySlug($slug: String!) {
							post(where: { slug: $slug }) {
								id
							}
						}
					`,
					variables: { slug }
				})
			});
			const postData = await getPost.json();
			const postId = postData?.data?.post?.id;

			if (!postId) return fail(404, { message: 'Post not found' });

			// 2. Unpublish post
			await fetch(HYGRAPH_API, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${HYGRAPH_MUTATION_TOKEN}`
				},
				body: JSON.stringify({
					query: `
						mutation UnpublishPost($id: ID!) {
							unpublishPost(where: { id: $id }) {
								id
							}
						}
					`,
					variables: { id: postId }
				})
			});

			// 3. Delete post
			await fetch(HYGRAPH_API, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${HYGRAPH_MUTATION_TOKEN}`
				},
				body: JSON.stringify({
					query: `
						mutation DeletePost($id: ID!) {
							deletePost(where: { id: $id }) {
								id
							}
						}
					`,
					variables: { id: postId }
				})
			});
		} catch (err) {
			console.error('Error deleting post:', err);
			return fail(500, { message: 'Internal server error' });
		}
		redirect(303, '/user/profile');
	}
};
