import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";

export const organizationSettings = pgTable(
  "organization_settings",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // Zoom: minimum minutes a member must attend to be auto-marked present
    minAttendanceDurationMinutes: integer("min_attendance_duration_minutes")
      .default(0)
      .notNull(),
    // Whether Zoom webhook should auto-mark members present
    zoomAutoMarkPresent: boolean("zoom_auto_mark_present").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("org_settings_organization_id_uidx").on(table.organizationId),
  ],
);

export const organizationSettingsRelations = relations(
  organizationSettings,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationSettings.organizationId],
      references: [organization.id],
    }),
  }),
);
