import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified')
		.$defaultFn(() => false)
		.notNull(),
	image: text('image'),
	createdAt: timestamp('created_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
	updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const like = pgTable('like', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	postId: text('post_id').notNull(),
	createdAt: timestamp('created_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const save = pgTable('save', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	postId: text('post_id').notNull(),
	postTitle: text('post_title').notNull(),
	postSlug: text('post_slug').notNull(),
	savedAt: timestamp('saved_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const comment = pgTable('comment', {
	id: text('id').primaryKey(),
	userFullName: text('user_full_name').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	postId: text('post_id').notNull(),
	parentCommentId: text('parent_comment_id').references((): any => comment.id, {
		onDelete: 'cascade'
	}),
	content: text('content').notNull(),
	createdAt: timestamp('created_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const review = pgTable('review', {
	id: text('id').primaryKey(),
	userFullName: text('user_full_name').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	toolId: text('tool_id').notNull(),
	title: text('title').notNull(),
	content: text('content').notNull(),

	createdAt: timestamp('created_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const newsletter = pgTable('newsletter', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	subscribed: boolean('subscribed')
		.$defaultFn(() => true)
		.notNull(),
	subscribedAt: timestamp('subscribed_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	unsubscribedAt: timestamp('unsubscribed_at')
});
