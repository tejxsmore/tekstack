import type { RequestHandler } from './$types';
import { auth } from '$lib/auth';
import { db } from '$lib/db';
import { save } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { postId, postTitle, postSlug, action } = await request.json();

	if (!postId || !action) {
		return new Response('Missing postId or action', { status: 400 });
	}

	const userId = session.user.id;

	if (action === 'save') {
		await db
			.insert(save)
			.values({
				id: crypto.randomUUID(),
				userId,
				postId,
				postTitle,
				postSlug
			})
			.onConflictDoNothing();
	} else if (action === 'unsave') {
		await db.delete(save).where(and(eq(save.userId, userId), eq(save.postId, postId)));
	} else {
		return new Response('Invalid action', { status: 400 });
	}

	return new Response('OK');
};
