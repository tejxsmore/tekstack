import type { RequestHandler } from './$types';
import { auth } from '$lib/auth';
import { db } from '$lib/db';
import { comment } from '$lib/db/schema'; // Import comment schema
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { postId, parentCommentId, comment: commentContent } = await request.json();

	if (!postId || !parentCommentId || !commentContent) {
		return new Response('Missing postId, parentCommentId or comment', { status: 400 });
	}

	const userId = session.user.id;
	const userFullName = session.user.name;

	try {
		// Verify that the parent comment exists and belongs to the same post
		const parentComment = await db
			.select()
			.from(comment)
			.where(and(eq(comment.id, parentCommentId), eq(comment.postId, postId)))
			.limit(1);

		if (parentComment.length === 0) {
			return new Response('Parent comment not found', { status: 404 });
		}

		await db.insert(comment).values({
			id: crypto.randomUUID(),
			userId,
			userFullName,
			postId,
			content: commentContent,
			createdAt: new Date(),
			parentCommentId: parentCommentId
		});

		return new Response('Reply created successfully', { status: 201 });
	} catch (error) {
		console.error('Error creating reply:', error);
		return new Response('Failed to create reply', { status: 500 });
	}
};
