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

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: userRoleEnum("role").notNull().default("talent"),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  status: userStatusEnum("status").notNull().default("pending"),
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

export const bookingRequestStatusEnum = pgEnum("booking_request_status", [
  "pending", "accepted", "declined"
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
  // Store which talent the client wants to book (for admin review)
  requestedTalentId: varchar("requested_talent_id").references(() => users.id),
  requestedTalentName: varchar("requested_talent_name"), // Store name for reference
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking talents junction table
export const bookingTalents = pgTable("booking_talents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  talentId: varchar("talent_id").references(() => users.id).notNull(),
  requestStatus: bookingRequestStatusEnum("request_status").notNull().default("pending"),
  responseMessage: text("response_message"), // Optional message when accepting/declining
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "blocked", "done"]);
export const taskScopeEnum = pgEnum("task_scope", ["booking", "talent", "general"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);

export const contractStatusEnum = pgEnum("contract_status", ["draft", "sent", "signed", "expired", "cancelled"]);
export const signatureStatusEnum = pgEnum("signature_status", ["pending", "signed", "expired"]);

export const announcementCategoryEnum = pgEnum("announcement_category", ["open-call", "event"]);

// Tasks
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scope: taskScopeEnum("scope").notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  talentId: varchar("talent_id").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  dueAt: timestamp("due_at"),
  assigneeId: varchar("assignee_id").references(() => users.id),
  attachmentUrls: text("attachment_urls").array().default(sql`'{}'::text[]`),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  bookingTalentId: varchar("booking_talent_id").references(() => bookingTalents.id).notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(), // Generated contract content
  pdfUrl: varchar("pdf_url"), // Stored PDF file path
  status: contractStatusEnum("status").notNull().default("draft"),
  dueDate: timestamp("due_date"), // When contract expires
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Signatures
export const signatures = pgTable("signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  signerId: varchar("signer_id").references(() => users.id).notNull(),
  signatureImageUrl: varchar("signature_image_url"), // Base64 or file path
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  status: signatureStatusEnum("status").notNull().default("pending"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  category: announcementCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  location: varchar("location").notNull(),
  date: timestamp("date").notNull(), // Event/casting date
  deadline: timestamp("deadline"), // Application deadline (optional)
  requirements: text("requirements").array().default(sql`'{}'::text[]`),
  compensation: varchar("compensation"), // Optional compensation info
  contactEmail: varchar("contact_email").notNull(),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
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
  contracts: many(contracts),
  signatures: many(signatures),
  announcements: many(announcements),
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
  contracts: many(contracts),
}));

export const bookingTalentsRelations = relations(bookingTalents, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [bookingTalents.bookingId],
    references: [bookings.id],
  }),
  talent: one(users, {
    fields: [bookingTalents.talentId],
    references: [users.id],
  }),
  contracts: many(contracts),
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

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [contracts.bookingId],
    references: [bookings.id],
  }),
  bookingTalent: one(bookingTalents, {
    fields: [contracts.bookingTalentId],
    references: [bookingTalents.id],
  }),
  createdBy: one(users, {
    fields: [contracts.createdBy],
    references: [users.id],
  }),
  signatures: many(signatures),
}));

export const signaturesRelations = relations(signatures, ({ one }) => ({
  contract: one(contracts, {
    fields: [signatures.contractId],
    references: [contracts.id],
  }),
  signer: one(users, {
    fields: [signatures.signerId],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdBy: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
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
}).extend({
  // Allow optional fields to be undefined instead of empty strings
  bookingId: z.string().optional().nullable(),
  talentId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  dueAt: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "talent", "client"]).default("talent"),
});

export const insertBookingTalentSchema = createInsertSchema(bookingTalents).omit({
  id: true,
  createdAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type RegisterUser = z.infer<typeof registerSchema>;
export type TalentProfile = typeof talentProfiles.$inferSelect;
export type InsertTalentProfile = z.infer<typeof insertTalentProfileSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type BookingTalent = typeof bookingTalents.$inferSelect;
export type InsertBookingTalent = z.infer<typeof insertBookingTalentSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Signature = typeof signatures.$inferSelect;
export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// Notifications
export const notificationTypeEnum = pgEnum("notification_type", [
  "booking_request",
  "booking_accepted", 
  "booking_declined",
  "contract_created",
  "contract_signed",
  "task_assigned",
  "talent_approved",
  "system_announcement"
]);

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional data (booking id, contract id, etc.)
  read: boolean("read").notNull().default(false),
  actionUrl: varchar("action_url"), // URL to navigate when clicked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification schema for validation
export const insertNotificationSchema = createInsertSchema(notifications);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
