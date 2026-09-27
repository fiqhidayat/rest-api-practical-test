import { sql } from "drizzle-orm";
import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const tasksTable = sqliteTable(
    "tasks",
    {
        id: int().primaryKey({ autoIncrement: true }),
        title: text().notNull(),
        description: text().notNull(),
        status: text().notNull(),
        priority: text().notNull(),
        createdAt: text()
            .notNull()
            .default(sql`CURRENT_TIMESTAMP`),
        updatedAt: text()
            .notNull()
            .default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => [uniqueIndex("title_idx").on(table.title)],
);

export type Task = typeof tasksTable.$inferSelect;
export type InsertTask = typeof tasksTable.$inferInsert;
