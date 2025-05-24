import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

interface Tag {
	name: string;
	slug: string;
	post: {
		title: string;
		slug: string;
		author: {
			name: string;
			slug: string;
		};
		createdAt: string;
	}[];
}

export const load: PageServerLoad = async ({ fetch, params }) => {
	const { tagSlug } = params;

	const query = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `
                query GetAuthor($slug: String!) {
                    tags(where: { slug: $slug }) {
                        name
                        slug
                        post {
                            title
                            slug
                            author {
                                name
                                slug
                            }
							createdAt
                        }
                    }
                }
            `,
			variables: {
				slug: tagSlug
			}
		})
	};

	const response = await fetch(env.HYGRAPH_API, query);
	const json = await response.json();
	const tag: Tag = json.data.tags[0];

	return {
		tag
	};
};
