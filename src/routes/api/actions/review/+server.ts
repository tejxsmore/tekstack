import type { RequestHandler } from './$types';
import { auth } from '$lib/auth';
import { db } from '$lib/db';
import { review } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { title, content, toolId } = await request.json();

	if (!title || !content || !toolId) {
		return new Response('Missing postId or comment', { status: 400 });
	}

	const userId = session.user.id;
	const userFullName = session.user.name;

	try {
		await db.insert(review).values({
			id: crypto.randomUUID(),
			userId,
			userFullName,
			toolId,
			title,
			content,
			createdAt: new Date()
		});

		return new Response('Comment created successfully', { status: 201 });
	} catch (error) {
		console.error('Error creating comment:', error);
		return new Response('Failed to create comment', { status: 500 });
	}
};
