import type { RequestHandler } from './$types';
import { auth } from '$lib/auth';
import { db } from '$lib/db';
import { newsletter } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { email } = await request.json();

	if (!email) {
		return new Response('Missing postId or action', { status: 400 });
	}

	try {
		await db
			.insert(newsletter)
			.values({
				id: crypto.randomUUID(),
				email: email,
				subscribed: true
			})
			.onConflictDoNothing();
	} catch (error) {
		return new Response('Invalid action', { status: 400 });
	}

	return new Response('OK');
};
