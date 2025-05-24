import type { Actions } from './$types';
import { auth } from '$lib/auth';
import { APIError } from 'better-auth/api';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const firstName = formData.get('firstname') as string;
		const lastName = formData.get('lastname') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const fullName = `${firstName} ${lastName}`;

		try {
			// Sign up and automatically sign in (asResponse returns raw response)
			const response = await auth.api.signUpEmail({
				body: {
					name: fullName,
					email,
					password
				},
				asResponse: true
			});

			// Handle cookies from the response
			const setCookieHeaders =
				response.headers.getSetCookie?.() ||
				response.headers.get('set-cookie')?.split(/,(?=\s*[^=]+=[^;]+)/) ||
				[];

			for (const cookieHeader of setCookieHeaders) {
				const [nameValue, ...attributes] = cookieHeader.trim().split(';');
				const [name, value] = nameValue.split('=');

				if (name && value) {
					const cookieOptions: any = {
						path: '/',
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax'
					};

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
					case 'UNPROCESSABLE_ENTITY':
						return { status: 422, errorMessage: 'User already exists. Sign In instead' };
					case 'BAD_REQUEST':
						return { status: 400, errorMessage: 'Invalid email address.' };
					default:
						return { status: 500, errorMessage: 'Something went wrong. Try again later.' };
				}
			}

			console.error('Unexpected error during signup:', error);
			return { status: 500, errorMessage: 'Internal server error.' };
		}

		redirect(302, '/');
	}
} satisfies Actions;
