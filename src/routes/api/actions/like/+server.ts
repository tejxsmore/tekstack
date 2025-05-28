import type { RequestHandler } from './$types';
import { auth } from '$lib/auth';
import { db } from '$lib/db';
import { like } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { postId, action } = await request.json();

	if (!postId || !action) {
		return new Response('Missing postId or action', { status: 400 });
	}

	const userId = session.user.id;

	if (action === 'like') {
		await db
			.insert(like)
			.values({
				id: crypto.randomUUID(),
				userId,
				postId
			})
			.onConflictDoNothing();
	} else if (action === 'unlike') {
		await db.delete(like).where(and(eq(like.userId, userId), eq(like.postId, postId)));
	} else {
		return new Response('Invalid action', { status: 400 });
	}

	return new Response('OK');
};
