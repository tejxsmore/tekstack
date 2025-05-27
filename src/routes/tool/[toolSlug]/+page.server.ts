import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

interface Tool {
	name: string;
	slug: string;
	logo: {
		url: string;
	};
	description: string;
	features: string;
	websiteUrl: string;
	category: {
		name: string;
		slug: string;
	};
}

export const load: PageServerLoad = async ({ fetch, params }) => {
	const { toolSlug } = params;

	const query = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `
                query getTool($slug: String!) {
                    tools(where: { slug: $slug }) {
                        name
                        slug
                        logo{
                            url
                        }
                        description
                        features
                        websiteUrl
                        category{
                            name
							slug
                        }
                    }
                }
            `,
			variables: {
				slug: toolSlug
			}
		})
	};

	const response = await fetch(env.HYGRAPH_API, query);
	const json = await response.json();
	const tool: Tool = json.data?.tools?.[0];

	return {
		tool
	};
};
