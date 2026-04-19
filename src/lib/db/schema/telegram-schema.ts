import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./better-auth-schema";

export const userTelegram = pgTable("user_telegram", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  telegramId: text("telegram_id").notNull().unique(),
  telegramUsername: text("telegram_username"),
  telegramFirstName: text("telegram_first_name"),
  telegramLastName: text("telegram_last_name"),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
});

// Temporary tokens used during the bot link flow
export const telegramVerification = pgTable("telegram_verification", {
  token: text("token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});
