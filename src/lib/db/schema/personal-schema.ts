import { pgTable, text, integer, timestamp, date, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./better-auth-schema";

export const dailyInvite = pgTable(
  "daily_invite",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("daily_invite_user_date_uidx").on(table.userId, table.date),
  ],
);

export const pointItem = pgTable("point_item", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const amaItem = pgTable("ama_item", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  recruitName: text("recruit_name").notNull(),
  agentCode: text("agent_code"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
