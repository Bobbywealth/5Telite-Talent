import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User role enum
export const userRoleEnum = pgEnum("user_role", ["admin", "talent", "client"]);
export const userStatusEnum = pgEnum("user_status", ["active", "pending", "suspended"]);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: userRoleEnum("role").notNull().default("talent"),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "rejected"]);
export const unionStatusEnum = pgEnum("union_status", ["SAG-AFTRA", "Non-Union", "Other"]);

// Talent profiles
export const talentProfiles = pgTable("talent_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stageName: varchar("stage_name"),
  categories: text("categories").array().default(sql`'{}'::text[]`),
  skills: text("skills").array().default(sql`'{}'::text[]`),
  bio: text("bio"),
  location: varchar("location"),
  experience: varchar("experience"), // Years of experience level
  unionStatus: unionStatusEnum("union_status"),
  // Measurements as JSON
  measurements: jsonb("measurements"),
  // Rates as JSON
  rates: jsonb("rates"),
  // Media URLs
  mediaUrls: text("media_urls").array().default(sql`'{}'::text[]`),
  resumeUrls: text("resume_urls").array().default(sql`'{}'::text[]`),
  // Social media as JSON
  social: jsonb("social"),
  // Guardian info for minors as JSON
  guardian: jsonb("guardian"),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookingStatusEnum = pgEnum("booking_status", [
  "inquiry", "proposed", "contract_sent", "signed", "invoiced", "paid", "completed", "cancelled"
]);

// Bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  location: varchar("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }),
  usage: jsonb("usage"), // territory, term, media
  deliverables: text("deliverables"),
  notes: text("notes"),
  status: bookingStatusEnum("status").notNull().default("inquiry"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking talents junction table
export const bookingTalents = pgTable("booking_talents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  talentId: varchar("talent_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "blocked", "done"]);
export const taskScopeEnum = pgEnum("task_scope", ["booking", "talent"]);

// Tasks
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scope: taskScopeEnum("scope").notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  talentId: varchar("talent_id").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  dueAt: timestamp("due_at"),
  assigneeId: varchar("assignee_id").references(() => users.id),
  attachmentUrls: text("attachment_urls").array().default(sql`'{}'::text[]`),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  talentProfile: one(talentProfiles, {
    fields: [users.id],
    references: [talentProfiles.userId],
  }),
  clientBookings: many(bookings, { relationName: "clientBookings" }),
  createdBookings: many(bookings, { relationName: "createdBookings" }),
  bookingTalents: many(bookingTalents),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
}));

export const talentProfilesRelations = relations(talentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [talentProfiles.userId],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id],
    relationName: "clientBookings",
  }),
  createdBy: one(users, {
    fields: [bookings.createdBy],
    references: [users.id],
    relationName: "createdBookings",
  }),
  bookingTalents: many(bookingTalents),
  tasks: many(tasks),
}));

export const bookingTalentsRelations = relations(bookingTalents, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingTalents.bookingId],
    references: [bookings.id],
  }),
  talent: one(users, {
    fields: [bookingTalents.talentId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  booking: one(bookings, {
    fields: [tasks.bookingId],
    references: [bookings.id],
  }),
  talent: one(users, {
    fields: [tasks.talentId],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "assignedTasks",
  }),
  createdBy: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: "createdTasks",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTalentProfileSchema = createInsertSchema(talentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  code: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingTalentSchema = createInsertSchema(bookingTalents).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TalentProfile = typeof talentProfiles.$inferSelect;
export type InsertTalentProfile = z.infer<typeof insertTalentProfileSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type BookingTalent = typeof bookingTalents.$inferSelect;
export type InsertBookingTalent = z.infer<typeof insertBookingTalentSchema>;
