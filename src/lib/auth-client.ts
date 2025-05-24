import { createAuthClient } from 'better-auth/svelte';

export const { signIn, signOut, useSession, forgetPassword, resetPassword } = createAuthClient({
	baseURL: 'http://localhost:5173'
});
