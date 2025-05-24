import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

interface Author {
	name: string;
	slug: string;
	post: {
		title: string;
		slug: string;
		author: {
			name: string;
			slug: string;
		};
		tag: {
			name: string;
			slug: string;
		}[];
		createdAt: string;
	}[];
}

export const load: PageServerLoad = async ({ fetch, params }) => {
	const { authorSlug } = params;

	const query = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `
                query GetAuthor($slug: String!) {
                    authors (where: { slug: $slug }) {
                        name
                        slug
                        post {
                            title
                            slug
							author {
								name
								slug
							}
                            tag {
                                name
                                slug
                            }
							createdAt
                        }
                    }
                }
            `,
			variables: {
				slug: authorSlug
			}
		})
	};

	const response = await fetch(env.HYGRAPH_API, query);
	const json = await response.json();
	const author: Author = json.data.authors[0];

	return {
		author
	};
};
