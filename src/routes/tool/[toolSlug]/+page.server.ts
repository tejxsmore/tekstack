import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import { review } from '$lib/db/schema';

interface Tool {
	id: string;
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
	toolType: {
		title: string;
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
						id
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
						toolType{
							title
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

	const reviews = await db.select().from(review).where(eq(review.toolId, tool?.id));

	return {
		tool,
		reviews
	};
};
