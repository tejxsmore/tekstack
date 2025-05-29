import type { PageServerLoad } from '../$types';
import { env } from '$env/dynamic/private';
import { db } from '$lib/db';
import { like, save, comment } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

interface Post {
	id: string;
	title: string;
	slug: string;
	tag: {
		name: string;
		slug: string;
	}[];
	author: {
		name: string;
		slug: string;
	};
	content: string;
	createdAt: string;
}

export const load: PageServerLoad = async ({ fetch, params }) => {
	const { blogSlug } = params;

	const query = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `
                query getPost($slug: String!) {
                    posts(where: { slug: $slug }) {
						id
                        title
                        slug
                        tag {
                            name
                            slug
                        }
                        author{
                            name
                            slug
                        }
                        content
						createdAt
                    }
                }
            `,
			variables: {
				slug: blogSlug
			}
		})
	};

	const response = await fetch(env.HYGRAPH_API, query);
	const json = await response.json();
	const post: Post | undefined = json.data?.posts?.[0];

	const likes = await db.select().from(like).where(eq(like.postId, post?.id));
	const saves = await db.select().from(save).where(eq(save.postId, post?.id));
	const comments = await db
		.select()
		.from(comment)
		.where(eq(comment.postId, post?.id))
		.orderBy(comment.createdAt);

	return {
		post,
		likes,
		saves,
		comments
	};
};
