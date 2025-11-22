import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// RFID Logs table
export const rfidLogs = pgTable("rfid_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertRfidLogSchema = createInsertSchema(rfidLogs).omit({
  id: true,
  timestamp: true,
}).extend({
  action: z.enum(["IN", "OUT"]),
});

export type InsertRfidLog = z.infer<typeof insertRfidLogSchema>;
export type RfidLog = typeof rfidLogs.$inferSelect;

export interface OccupancyData {
  current: number;
  totalIn: number;
  totalOut: number;
  peak: number;
  lastUpdated: string;
  status: "low" | "medium" | "high";
}

export interface OccupancyStats {
  current: number;
  totalIn: number;
  totalOut: number;
  peak: number;
  capacity: number;
  percentage: number;
  status: "low" | "medium" | "high";
  lastUpdated: string;
}
