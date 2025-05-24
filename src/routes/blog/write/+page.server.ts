import { auth } from '$lib/auth';
import type { PageServerLoad } from '../$types';
import { redirect, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

interface Author {
	name: string;
	slug: string;
	email: string;
	bio: string;
}

interface Tag {
	name: string;
	slug: string;
}

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

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
						name
						slug
						email
						bio
					}
					tags {
						name
						slug
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
		user: session?.user || null,
		author
	};
};

function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-');
}

export const actions = {
	register: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const title = formData.get('title') as string;
		const email = formData.get('email') as string;
		const bio = formData.get('bio') as string;

		const websiteRaw = formData.get('website')?.toString().trim() || '';
		const instagramUsername = formData.get('instagram')?.toString().trim() || '';
		const facebookUsername = formData.get('facebook')?.toString().trim() || '';
		const linkedinUsername = formData.get('linkedin')?.toString().trim() || '';

		const website = websiteRaw || null;
		const instagram = instagramUsername ? `https://instagram.com/${instagramUsername}` : null;
		const facebook = facebookUsername ? `https://facebook.com/${facebookUsername}` : null;
		const linkedin = linkedinUsername ? `https://linkedin.com/in/${linkedinUsername}` : null;

		const slug = slugify(name);

		try {
			const mutation = `
				mutation CreateAndPublishAuthor(
					$name: String!,
					$email: String!,
					$title: String!,
					$slug: String!,
					$bio: String!,
					$website: String,
					$instagram: String,
					$facebook: String,
					$linkedin: String
				) {
					createAuthor(data: {
						name: $name,
						email: $email,
						title: $title,
						slug: $slug,
						bio: $bio,
						website: $website,
						instagram: $instagram,
						facebook: $facebook,
						linkedin: $linkedin
					}) {
						id
					}
					publishAuthor(where: { slug: $slug }) {
						id
					}
				}
			`;

			const variables = {
				name,
				email,
				title,
				slug,
				bio,
				website,
				instagram,
				facebook,
				linkedin
			};

			const response = await fetch(env.HYGRAPH_API, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
				},
				body: JSON.stringify({ query: mutation, variables })
			});

			const result = await response.json();

			if (result.errors) {
				console.error('Hygraph errors:', result.errors);
				return {
					status: 500,
					body: { error: 'Failed to register author due to Hygraph error' }
				};
			}
		} catch (error) {
			console.error('Hygraph Error:', error);
			return {
				status: 500,
				body: { error: 'Failed to register author' }
			};
		}

		redirect(302, '/blog/write');
	},

	write: async ({ request }) => {
		const formData = await request.formData();

		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		const email = formData.get('email') as string;
		const rawTags = formData.get('tags') as string;

		// Validate required fields
		if (!title?.trim()) {
			return fail(400, { error: 'Title is required', title, content, tags: rawTags });
		}
		if (!content?.trim()) {
			return fail(400, { error: 'Content is required', title, content, tags: rawTags });
		}
		if (!email?.trim()) {
			return fail(400, { error: 'Email is required', title, content, tags: rawTags });
		}

		const slug = slugify(title);
		const tags = rawTags
			? rawTags
					.replace(/\s+and\s+/gi, ',')
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0)
			: [];

		try {
			// 1. Get author id
			const authorQuery = await fetch(env.HYGRAPH_API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: `
						query GetAuthorByEmail($email: String!) {
							author (where: { email: $email }) {
								id
							}
						}
					`,
					variables: { email }
				})
			});

			if (!authorQuery.ok) {
				console.error('Failed to fetch author:', authorQuery.statusText);
				return fail(500, {
					error: 'Failed to verify author',
					title,
					content,
					tags: rawTags
				});
			}

			const authorJson = await authorQuery.json();

			if (authorJson.errors) {
				console.error('Author query errors:', authorJson.errors);
				return fail(500, {
					error: 'Failed to verify author',
					title,
					content,
					tags: rawTags
				});
			}

			const authorId = authorJson?.data?.author?.id;
			if (!authorId) {
				return fail(404, {
					error: 'Author not found. Please register as an author first.',
					title,
					content,
					tags: rawTags
				});
			}

			// 2. Handle tags
			let resolvedTagSlugs: string[] = [];

			if (tags.length > 0) {
				// 2.1 Get existing tags
				const tagRes = await fetch(env.HYGRAPH_API, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						query: `
							query GetTagsByNames($names: [String!]) {
								tags(where: { name_in: $names }) {
									slug
									name
								}
							}
						`,
						variables: { names: tags }
					})
				});

				if (!tagRes.ok) {
					console.error('Failed to fetch tags:', tagRes.statusText);
					return fail(500, {
						error: 'Failed to process tags',
						title,
						content,
						tags: rawTags
					});
				}

				const tagData = await tagRes.json();

				if (tagData.errors) {
					console.error('Tag query errors:', tagData.errors);
					return fail(500, {
						error: 'Failed to process tags',
						title,
						content,
						tags: rawTags
					});
				}

				const existingTags = tagData?.data?.tags ?? [];
				resolvedTagSlugs = existingTags.map((tag: { slug: string }) => tag.slug);

				const newTags = tags.filter(
					(tag) =>
						!existingTags.some((existing: any) => existing.name.toLowerCase() === tag.toLowerCase())
				);

				// 2.2 Create and publish new tags
				for (const name of newTags) {
					const tagSlug = slugify(name);

					const response = await fetch(env.HYGRAPH_API, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
						},
						body: JSON.stringify({
							query: `
								mutation CreateAndPublishTag($name: String!, $slug: String!) {
									createTag(data: { name: $name, slug: $slug }) {
										slug
									}
									publishTag(where: { slug: $slug }) {
										slug
									}
								}
							`,
							variables: { name, slug: tagSlug }
						})
					});

					if (!response.ok) {
						console.error(`Failed to create tag "${name}":`, response.statusText);
						continue; // Continue with other tags instead of failing completely
					}

					const json = await response.json();

					if (json.errors) {
						console.error(`Failed to create tag "${name}":`, json.errors);
						continue;
					}

					const publishedSlug = json?.data?.publishTag?.slug;
					if (publishedSlug) {
						resolvedTagSlugs.push(publishedSlug);
					}
				}
			}

			// 3. Create and publish the post in one mutation
			const tagConnections = resolvedTagSlugs.map((slug) => ({ slug }));

			const createAndPublishPostRes = await fetch(env.HYGRAPH_API, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
				},
				body: JSON.stringify({
					query: `
						mutation CreateAndPublishPost(
							$title: String!, 
							$content: String!, 
							$slug: String!, 
							$tag: [TagWhereUniqueInput!], 
							$authorId: ID!
						) {
							createPost(data: {
								title: $title,
								content: $content,
								slug: $slug,
								date: "${new Date().toISOString()}",
								author: { connect: { id: $authorId } },
								tag: { connect: $tag }
							}) {
								id
								slug
							}
							publishPost(where: { slug: $slug }) {
								id
								slug
								publishedAt
							}
						}
					`,
					variables: {
						title,
						slug,
						content,
						tag: tagConnections,
						authorId
					}
				})
			});

			if (!createAndPublishPostRes.ok) {
				console.error('Failed to create and publish post:', createAndPublishPostRes.statusText);
				return fail(500, {
					error: 'Failed to publish blog post',
					title,
					content,
					tags: rawTags
				});
			}

			const createAndPublishJson = await createAndPublishPostRes.json();

			if (createAndPublishJson.errors) {
				console.error('Create and publish post errors:', createAndPublishJson.errors);
				return fail(500, {
					error: 'Failed to publish blog post',
					title,
					content,
					tags: rawTags
				});
			}

			const createdPost = createAndPublishJson?.data?.createPost;
			const publishedPost = createAndPublishJson?.data?.publishPost;

			if (!createdPost?.id) {
				console.error('Failed to create post:', createAndPublishJson);
				return fail(500, {
					error: 'Failed to create blog post',
					title,
					content,
					tags: rawTags
				});
			}

			if (!publishedPost?.id) {
				console.error('Failed to publish post:', createAndPublishJson);
				return fail(500, {
					error: 'Blog post was created but failed to publish',
					title,
					content,
					tags: rawTags
				});
			}
		} catch (error) {
			console.error('Error in write blog action:', error);
			return fail(500, {
				error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				title,
				content,
				tags: rawTags
			});
		}
		redirect(303, `/blog`);
	}
} satisfies Actions;
