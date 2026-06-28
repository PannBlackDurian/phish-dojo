// =============================================================================
//  Database schema (Drizzle + SQLite).
//  Two tables:
//    · scenarios — the training emails, moved out of the bundle into the DB.
//      The rich structure (body spans, cues, decoys) is kept as a JSON column,
//      with the fields we want to query lifted out as real columns.
//    · runs      — one row per completed drill, powering the leaderboard.
// =============================================================================

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { TrainingEmail } from '../../types';

export const scenarios = sqliteTable('scenarios', {
	id: text('id').primaryKey(),
	subject: text('subject').notNull(),
	isPhishing: integer('is_phishing', { mode: 'boolean' }).notNull(),
	difficulty: integer('difficulty').notNull(),
	orderIndex: integer('order_index').notNull().default(0),
	data: text('data', { mode: 'json' }).notNull().$type<TrainingEmail>()
});

export const runs = sqliteTable('runs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	alias: text('alias').notNull(),
	score: integer('score').notNull(),
	accuracy: integer('accuracy').notNull(),
	cuesCaught: integer('cues_caught').notNull(),
	cuesTotal: integer('cues_total').notNull(),
	rank: text('rank').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
});

export type ScenarioRow = typeof scenarios.$inferSelect;
export type RunRow = typeof runs.$inferSelect;
export type NewRun = typeof runs.$inferInsert;
