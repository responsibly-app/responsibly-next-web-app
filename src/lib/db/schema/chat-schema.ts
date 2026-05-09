import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./better-auth-schema";

export const chatThread = pgTable(
  "chat_thread",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    status: text("status").default("regular").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("chat_thread_user_id_idx").on(table.userId)],
);

export const chatMessage = pgTable(
  "chat_message",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => chatThread.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    format: text("format").notNull(),
    content: jsonb("content").notNull().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("chat_message_thread_id_idx").on(table.threadId)],
);

export const chatTokenUsage = pgTable(
  "chat_token_usage",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // "YYYY-MM-DD"
    modelTier: text("model_tier").notNull().default("primary"), // "primary" | "fallback"
    inputTokens: integer("input_tokens").default(0).notNull(),
    outputTokens: integer("output_tokens").default(0).notNull(),
    totalTokens: integer("total_tokens").default(0).notNull(),
    reasoningTokens: integer("reasoning_tokens").default(0).notNull(),
    cacheReadTokens: integer("cache_read_tokens").default(0).notNull(),
    cacheWriteTokens: integer("cache_write_tokens").default(0).notNull(),
    noCacheInputTokens: integer("no_cache_input_tokens").default(0).notNull(),
    textOutputTokens: integer("text_output_tokens").default(0).notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("chat_token_usage_user_date_tier_uidx").on(table.userId, table.date, table.modelTier),
    index("chat_token_usage_user_id_idx").on(table.userId),
  ],
);
