import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

interface Tool {
	name: string;
	slug: string;
	logo: {
		url: string;
	};
	description: string;
	websiteUrl: string;
	category: {
		name: string;
		slug: string;
	};
	toolType: {
		title: string;
		slug: string;
	};
	platform: {
		name: string;
		slug: string;
	};
}

interface Category {
	name: string;
	slug: string;
}

interface Platform {
	name: string;
	slug: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	const query = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: ` {
                tools {
                    name
                    slug
                    logo {
                        url
                    }
                    description
                    websiteUrl
                    category {
                        name
                        slug
                    }
					toolType{
						title
						slug
					}
                    platform {
                        name
                        slug
                    }
                }
                
                categories {
                    name
                    slug
                }

                platforms {
                    name
                    slug
                }
            }
        `
		})
	};

	const response = await fetch(env.HYGRAPH_API, query);
	const json = await response.json();
	const allTools: Tool[] = json.data.tools;
	const categories: Category[] = json.data.categories;
	const platforms: Platform[] = json.data.platforms;

	const sponsoredTools = allTools.filter((tool) => tool.toolType.slug === 'sponsored');
	const otherTools = allTools.filter((tool) => tool.toolType.slug !== 'sponsored');
	const tools = [...sponsoredTools, ...otherTools];

	return {
		tools,
		categories,
		platforms
	};
};
