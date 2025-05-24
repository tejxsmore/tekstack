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
	content: string;
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

	return {
		post
	};
};
