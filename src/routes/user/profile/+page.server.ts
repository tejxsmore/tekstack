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
		tag: {
			name: string;
			slug: string;
		}[];
		content: string;
		createdAt: string;
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
								tag{
									name
									slug
								}
								content
								createdAt
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

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-');
}

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
	},

	edit: async ({ request }) => {
		const formData = await request.formData();

		const authorEmail = formData.get('email') as string;
		const title = formData.get('title') as string;
		const oldSlug = formData.get('slug') as string;
		const newSlug = slugify(title);
		const rawTags = formData.get('tags') as string;
		const content = formData.get('content') as string;
		const tags = rawTags
			? rawTags
					.replace(/\s+and\s+/gi, ',')
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0)
			: [];

		try {
			// 1. Get Author ID
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
					variables: { email: authorEmail }
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

			// 2. Get Post ID and current tags
			const findPostRes = await fetch(env.HYGRAPH_API, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
				},
				body: JSON.stringify({
					query: `
				query GetPostBySlug($slug: String!) {
					post(where: { slug: $slug }) {
						id
						tag {
							slug
						}
					}
				}
			`,
					variables: { slug: oldSlug }
				})
			});

			if (!findPostRes.ok) {
				console.error('Failed to fetch post:', findPostRes.statusText);
				return fail(500, {
					error: 'Failed to fetch post',
					title,
					content,
					tags: rawTags
				});
			}

			const findPostData = await findPostRes.json();

			if (findPostData.errors) {
				console.error('Find post query errors:', findPostData.errors);
				return fail(500, {
					error: 'Failed to fetch post',
					title,
					content,
					tags: rawTags
				});
			}

			const post = findPostData?.data?.post;
			if (!post?.id) {
				return fail(404, {
					error: 'Post not found',
					title,
					content,
					tags: rawTags
				});
			}

			const postId = post.id;
			const existingTagSlugs = post.tag?.map((tag: { slug: string }) => tag.slug) || [];

			// 3. Resolve and/or create new tags
			let resolvedTagIds: string[] = [];
			const inputTagSlugs = Array.isArray(tags) ? tags.map(slugify) : [];

			if (inputTagSlugs.length > 0) {
				// Fetch existing tags (both published AND draft) with IDs
				const tagRes = await fetch(env.HYGRAPH_API, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
					},
					body: JSON.stringify({
						query: `
					query GetTagsByNames($names: [String!]) {
						tags(where: { name_in: $names }, stage: DRAFT) {
							id
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
				const existingTagMap = new Map();
				existingTags.forEach((tag: { id: string; slug: string; name: string }) => {
					existingTagMap.set(tag.slug, tag.id);
				});

				// Create new tags if needed
				const newTags = tags.filter((tag: string) => !existingTagMap.has(slugify(tag)));

				for (const name of newTags) {
					const slug = slugify(name);

					// Check if tag already exists by slug (race condition protection) - check DRAFT stage
					const checkExistingRes = await fetch(env.HYGRAPH_API, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
						},
						body: JSON.stringify({
							query: `
						query CheckTagExists($slug: String!) {
							tag(where: { slug: $slug }, stage: DRAFT) {
								id
								slug
							}
						}
					`,
							variables: { slug }
						})
					});

					if (checkExistingRes.ok) {
						const checkData = await checkExistingRes.json();
						if (checkData?.data?.tag?.id) {
							// Tag already exists (even if draft), add to existing map
							existingTagMap.set(slug, checkData.data.tag.id);
							continue;
						}
					}

					// Try to create tag with upsert-like behavior
					const createTagRes = await fetch(env.HYGRAPH_API, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
						},
						body: JSON.stringify({
							query: `
						mutation CreateTag($name: String!, $slug: String!) {
							createTag(data: { name: $name, slug: $slug }) {
								id
								slug
								name
							}
						}
					`,
							variables: { name: name.trim(), slug }
						})
					});

					if (!createTagRes.ok) {
						console.error('Failed to create tag (HTTP error):', name, createTagRes.statusText);
						// Try to fetch the tag again in case it was created by another process
						const retryFetch = await fetch(env.HYGRAPH_API, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
							},
							body: JSON.stringify({
								query: `
							query GetTagBySlug($slug: String!) {
								tag(where: { slug: $slug }, stage: DRAFT) {
									id
									slug
								}
							}
						`,
								variables: { slug }
							})
						});

						if (retryFetch.ok) {
							const retryData = await retryFetch.json();
							if (retryData?.data?.tag?.id) {
								existingTagMap.set(slug, retryData.data.tag.id);
								continue;
							}
						}

						// If still fails, continue with other tags instead of failing entirely
						console.error(`Skipping tag creation for: ${name}`);
						continue;
					}

					const createData = await createTagRes.json();

					if (createData.errors) {
						console.error('Create tag GraphQL errors:', createData.errors);

						// Check if error indicates tag already exists
						const duplicateError = createData.errors.some(
							(error: any) =>
								error.message?.toLowerCase().includes('duplicate') ||
								error.message?.toLowerCase().includes('unique') ||
								error.message?.toLowerCase().includes('already exists')
						);

						if (duplicateError) {
							// Tag exists, try to fetch it from DRAFT stage
							const fetchExistingRes = await fetch(env.HYGRAPH_API, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
								},
								body: JSON.stringify({
									query: `
								query GetTagBySlug($slug: String!) {
									tag(where: { slug: $slug }, stage: DRAFT) {
										id
										slug
									}
								}
							`,
									variables: { slug }
								})
							});

							if (fetchExistingRes.ok) {
								const existingData = await fetchExistingRes.json();
								if (existingData?.data?.tag?.id) {
									existingTagMap.set(slug, existingData.data.tag.id);
									continue;
								}
							}
						}

						// Continue with other tags instead of failing entirely
						console.error(`Skipping tag creation for: ${name}`);
						continue;
					}

					const createdTag = createData?.data?.createTag;

					if (createdTag?.id) {
						existingTagMap.set(createdTag.slug, createdTag.id);

						// Add a small delay to ensure the tag is ready
						await new Promise((resolve) => setTimeout(resolve, 100));
					} else {
						console.error('Failed to create tag - no ID returned:', name);
						// Continue with other tags instead of failing entirely
						continue;
					}
				}

				// Get all tag IDs for the resolved tags
				resolvedTagIds = inputTagSlugs
					.map((slug) => existingTagMap.get(slug))
					.filter((id) => id !== undefined);
			}

			// 4. Get current tag IDs from the post
			const currentTagIds =
				post.tag?.map((tag: { slug: string }) => {
					// We need to get the IDs of current tags, but we only have slugs
					// We'll handle this in the connection logic
					return tag.slug;
				}) || [];

			// 5. Ensure all resolved tags are published before connecting
			const publishPromises = resolvedTagIds.map(async (tagId) => {
				try {
					const publishRes = await fetch(env.HYGRAPH_API, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
						},
						body: JSON.stringify({
							query: `
						mutation PublishTag($id: ID!) {
							publishTag(where: { id: $id }) {
								id
								slug
							}
						}
					`,
							variables: { id: tagId }
						})
					});

					if (!publishRes.ok) {
						console.error('Failed to publish tag before connection:', tagId);
					} else {
						const publishData = await publishRes.json();
						if (publishData.errors) {
							console.error('Publish tag errors before connection:', publishData.errors);
						}
					}
				} catch (error) {
					console.error('Error publishing tag before connection:', tagId, error);
				}
			});

			// Wait for all tags to be published
			await Promise.all(publishPromises);

			// Add a delay to ensure all tags are fully published
			await new Promise((resolve) => setTimeout(resolve, 500));

			// 6. Prepare tag connections using IDs
			const tagConnections =
				resolvedTagIds.length > 0
					? `tag: { set: [${resolvedTagIds.map((id) => `{ id: "${id}" }`).join(', ')}] },`
					: `tag: { set: [] },`;

			// 7. Update the post
			const escapedTitle = title.replace(/"/g, '\\"');
			const escapedContent = content
				.replace(/\\/g, '\\\\')
				.replace(/"/g, '\\"')
				.replace(/\n/g, '\\n');

			const mutation = `
		mutation UpdatePost {
			updatePost(
				where: { id: "${postId}" }
				data: {
					title: "${escapedTitle}",
					slug: "${newSlug}",
					content: "${escapedContent}",
					${tagConnections}
					author: { connect: { id: "${authorId}" } }
				}
			) {
				id
				slug
			}

			publishPost(where: { id: "${postId}" }) {
				id
			}
		}
	`;

			const updateRes = await fetch(env.HYGRAPH_API, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.HYGRAPH_MUTATION_TOKEN}`
				},
				body: JSON.stringify({ query: mutation })
			});

			if (!updateRes.ok) {
				console.error('Failed to update post:', updateRes.statusText);
				return fail(500, {
					error: 'Failed to update post',
					title,
					content,
					tags: rawTags
				});
			}

			const updateData = await updateRes.json();

			if (updateData.errors) {
				console.error('GraphCMS update error:', updateData.errors);
				return fail(500, {
					error: 'Failed to update post',
					title,
					content,
					tags: rawTags,
					details: updateData.errors
				});
			}
		} catch (error: any) {
			console.error('Edit API route error:', error);
			return fail(500, {
				error: 'An unexpected error occurred while updating the post',
				title,
				content,
				tags: rawTags
			});
		}

		redirect(302, '/user/profile');
	}
};
