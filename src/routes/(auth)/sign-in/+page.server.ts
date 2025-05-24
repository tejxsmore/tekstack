import type { Actions } from './$types';
import { auth } from '$lib/auth';
import { APIError } from 'better-auth/api';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		try {
			const response = await auth.api.signInEmail({
				body: {
					email,
					password
				},
				asResponse: true
			});

			// Better cookie parsing - handles multiple Set-Cookie headers
			const setCookieHeaders =
				response.headers.getSetCookie?.() ||
				response.headers.get('set-cookie')?.split(/,(?=\s*[^=]+=[^;]+)/) ||
				[];

			for (const cookieHeader of setCookieHeaders) {
				const [nameValue, ...attributes] = cookieHeader.trim().split(';');
				const [name, value] = nameValue.split('=');

				if (name && value) {
					// Parse cookie attributes
					const cookieOptions: any = {
						path: '/',
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax'
					};

					// Override with actual attributes from the cookie
					for (const attr of attributes) {
						const [key, val] = attr.trim().split('=');
						const lowerKey = key.toLowerCase();

						switch (lowerKey) {
							case 'path':
								cookieOptions.path = val || '/';
								break;
							case 'domain':
								cookieOptions.domain = val;
								break;
							case 'max-age':
								cookieOptions.maxAge = parseInt(val);
								break;
							case 'expires':
								cookieOptions.expires = new Date(val);
								break;
							case 'httponly':
								cookieOptions.httpOnly = true;
								break;
							case 'secure':
								cookieOptions.secure = true;
								break;
							case 'samesite':
								cookieOptions.sameSite = val as 'strict' | 'lax' | 'none';
								break;
						}
					}

					cookies.set(name.trim(), decodeURIComponent(value), cookieOptions);
				}
			}
		} catch (error) {
			if (error instanceof APIError) {
				console.warn('API error status:', error.status);

				switch (error.status) {
					case 'UNAUTHORIZED':
						return { status: 401, errorMessage: 'User not found or wrong credentials.' };
					case 'BAD_REQUEST':
						return { status: 400, errorMessage: 'Invalid email format or request.' };
					default:
						return { status: 500, errorMessage: 'Something went wrong. Try again later.' };
				}
			}

			console.error('Unexpected error during signin:', error);
			return { status: 500, errorMessage: 'Internal server error.' };
		}

		redirect(302, '/');
	}
} satisfies Actions;
