import type { PageServerLoad } from '../$types';
import { env } from '$env/dynamic/private';

interface Post {
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
	createdAt: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	const query = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `
          {
            posts {
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
				createdAt
            }
          }`
		})
	};

	const response = await fetch(env.HYGRAPH_API, query);
	const json = await response.json();
	const posts: Post[] = json.data.posts;

	return {
		posts
	};
};
