import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const accounts = sqliteTable('cloud_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().default('Гость'),
  birth: text('birth_date'),
  email: text('email'),
  password: text('password'),
  focus: text('focus').notNull().default('Ясность'),
}, t => [uniqueIndex('cloud_accounts_email').on(t.email)]);
export const sessions = sqliteTable('cloud_sessions', {
  key: text('key').primaryKey(),
  owner: integer('owner').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  expires: integer('expires').notNull(),
}, t => [index('cloud_sessions_owner').on(t.owner)]);
export const records = sqliteTable('cloud_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  owner: integer('owner').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  key: text('key').notNull(),
  data: text('data').notNull(),
}, t => [uniqueIndex('cloud_records_owner_kind_key').on(t.owner, t.kind, t.key)]);
export const rates = sqliteTable('cloud_rates', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  until: integer('until').notNull(),
});
