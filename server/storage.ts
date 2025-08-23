import {
  users,
  talentProfiles,
  bookings,
  bookingTalents,
  tasks,
  type User,
  type UpsertUser,
  type TalentProfile,
  type InsertTalentProfile,
  type Booking,
  type InsertBooking,
  type Task,
  type InsertTask,
  type BookingTalent,
  type InsertBookingTalent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Talent operations
  getTalentProfile(userId: string): Promise<TalentProfile | undefined>;
  createTalentProfile(profile: InsertTalentProfile): Promise<TalentProfile>;
  updateTalentProfile(userId: string, profile: Partial<InsertTalentProfile>): Promise<TalentProfile>;
  getAllTalents(options?: {
    category?: string;
    skills?: string[];
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ talents: (TalentProfile & { user: User })[], total: number }>;
  approveTalent(userId: string, status: "approved" | "rejected"): Promise<TalentProfile>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<(Booking & { client: User; createdBy: User; bookingTalents: (BookingTalent & { talent: User })[] }) | undefined>;
  getAllBookings(options?: {
    status?: string;
    talentId?: string;
    clientId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ bookings: (Booking & { client: User; createdBy: User; bookingTalents: (BookingTalent & { talent: User })[] })[], total: number }>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking>;
  addTalentToBooking(bookingId: string, talentId: string): Promise<BookingTalent>;

  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getAllTasks(options?: {
    bookingId?: string;
    talentId?: string;
    assigneeId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tasks: (Task & { assignee?: User; booking?: Booking; talent?: User })[], total: number }>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;

  // Demo data seeding
  seedDemoData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getTalentProfile(userId: string): Promise<TalentProfile | undefined> {
    const [profile] = await db
      .select()
      .from(talentProfiles)
      .where(eq(talentProfiles.userId, userId));
    return profile;
  }

  async createTalentProfile(profile: InsertTalentProfile): Promise<TalentProfile> {
    const [created] = await db
      .insert(talentProfiles)
      .values(profile)
      .returning();
    return created;
  }

  async updateTalentProfile(userId: string, profile: Partial<InsertTalentProfile>): Promise<TalentProfile> {
    const [updated] = await db
      .update(talentProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(talentProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getAllTalents(options: {
    category?: string;
    skills?: string[];
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ talents: (TalentProfile & { user: User })[], total: number }> {
    const {
      category,
      skills,
      location,
      search,
      limit = 20,
      offset = 0,
    } = options;

    const conditions = [eq(talentProfiles.approvalStatus, "approved")];

    if (category) {
      conditions.push(sql`${category} = ANY(${talentProfiles.categories})`);
    }

    if (skills && skills.length > 0) {
      conditions.push(sql`${talentProfiles.skills} && ${skills}`);
    }

    if (location) {
      conditions.push(ilike(talentProfiles.location, `%${location}%`));
    }

    if (search) {
      conditions.push(
        sql`(${talentProfiles.stageName} ILIKE ${`%${search}%`} OR 
             ${users.firstName} ILIKE ${`%${search}%`} OR 
             ${users.lastName} ILIKE ${`%${search}%`})`
      );
    }

    let query = db
      .select()
      .from(talentProfiles)
      .innerJoin(users, eq(talentProfiles.userId, users.id))
      .where(and(...conditions));

    const talents = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(talentProfiles.updatedAt));

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(talentProfiles)
      .innerJoin(users, eq(talentProfiles.userId, users.id))
      .where(and(...conditions));

    return {
      talents: talents.map(row => ({ ...row.talent_profiles, user: row.users })),
      total: countResult.count,
    };
  }

  async approveTalent(userId: string, status: "approved" | "rejected"): Promise<TalentProfile> {
    const [updated] = await db
      .update(talentProfiles)
      .set({ approvalStatus: status, updatedAt: new Date() })
      .where(eq(talentProfiles.userId, userId))
      .returning();
    return updated;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    // Generate booking code
    const year = new Date().getFullYear();
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(sql`EXTRACT(YEAR FROM created_at) = ${year}`);

    const code = `BK-${year}-${String(count[0].count + 1).padStart(4, '0')}`;

    const [created] = await db
      .insert(bookings)
      .values({ ...booking, code })
      .returning();
    return created;
  }

  async getBooking(id: string): Promise<(Booking & { client: User; createdBy: User; bookingTalents: (BookingTalent & { talent: User })[] }) | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .innerJoin(users, eq(bookings.clientId, users.id))
      .where(eq(bookings.id, id));

    if (!booking) return undefined;

    const [createdBy] = await db
      .select()
      .from(users)
      .where(eq(users.id, booking.bookings.createdBy));

    const bookingTalentsResult = await db
      .select()
      .from(bookingTalents)
      .innerJoin(users, eq(bookingTalents.talentId, users.id))
      .where(eq(bookingTalents.bookingId, id));

    return {
      ...booking.bookings,
      client: booking.users,
      createdBy,
      bookingTalents: bookingTalentsResult.map(row => ({ ...row.booking_talents, talent: row.users })),
    };
  }

  async getAllBookings(options: {
    status?: string;
    talentId?: string;
    clientId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ bookings: (Booking & { client: User; createdBy: User; bookingTalents: (BookingTalent & { talent: User })[] })[], total: number }> {
    const { status, talentId, clientId, limit = 20, offset = 0 } = options;

    const conditions = [];
    let joinTalents = false;

    if (status) {
      conditions.push(eq(bookings.status, status as any));
    }

    if (clientId) {
      conditions.push(eq(bookings.clientId, clientId));
    }

    if (talentId) {
      joinTalents = true;
      conditions.push(eq(bookingTalents.talentId, talentId));
    }

    let query = db
      .select()
      .from(bookings)
      .innerJoin(users, eq(bookings.clientId, users.id));

    if (joinTalents) {
      query = query.innerJoin(bookingTalents, eq(bookings.id, bookingTalents.bookingId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(bookings.createdAt));

    // Get created by user and booking talents for each booking
    const bookingsWithDetails = await Promise.all(
      results.map(async (row) => {
        const [createdBy] = await db
          .select()
          .from(users)
          .where(eq(users.id, row.bookings.createdBy));

        const bookingTalentsResult = await db
          .select()
          .from(bookingTalents)
          .innerJoin(users, eq(bookingTalents.talentId, users.id))
          .where(eq(bookingTalents.bookingId, row.bookings.id));

        return {
          ...row.bookings,
          client: row.users,
          createdBy,
          bookingTalents: bookingTalentsResult.map(btRow => ({ ...btRow.booking_talents, talent: btRow.users })),
        };
      })
    );

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings);

    return {
      bookings: bookingsWithDetails,
      total: countResult.count,
    };
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async addTalentToBooking(bookingId: string, talentId: string): Promise<BookingTalent> {
    const [created] = await db
      .insert(bookingTalents)
      .values({ bookingId, talentId })
      .returning();
    return created;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return created;
  }

  async getAllTasks(options: {
    bookingId?: string;
    talentId?: string;
    assigneeId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ tasks: (Task & { assignee?: User; booking?: Booking; talent?: User })[], total: number }> {
    const { bookingId, talentId, assigneeId, status, limit = 20, offset = 0 } = options;

    const conditions = [];

    if (bookingId) {
      conditions.push(eq(tasks.bookingId, bookingId));
    }

    if (talentId) {
      conditions.push(eq(tasks.talentId, talentId));
    }

    if (assigneeId) {
      conditions.push(eq(tasks.assigneeId, assigneeId));
    }

    if (status) {
      conditions.push(eq(tasks.status, status as any));
    }

    let query = db.select().from(tasks);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tasks.createdAt));

    // Get related data for each task
    const tasksWithDetails = await Promise.all(
      results.map(async (task) => {
        const assignee = task.assigneeId 
          ? await db.select().from(users).where(eq(users.id, task.assigneeId)).then(rows => rows[0])
          : undefined;
        
        const booking = task.bookingId 
          ? await db.select().from(bookings).where(eq(bookings.id, task.bookingId)).then(rows => rows[0])
          : undefined;
        
        const talent = task.talentId 
          ? await db.select().from(users).where(eq(users.id, task.talentId)).then(rows => rows[0])
          : undefined;

        return {
          ...task,
          assignee,
          booking,
          talent,
        };
      })
    );

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks);

    return {
      tasks: tasksWithDetails,
      total: countResult.count,
    };
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async seedDemoData(): Promise<void> {
    // Check if demo data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Demo data already exists, skipping seed");
      return;
    }

    console.log("Seeding demo data...");

    // Create demo users
    const adminUser = await this.upsertUser({
      id: "admin-demo-id",
      role: "admin",
      email: "admin@5t.com",
      firstName: "Admin",
      lastName: "User",
      status: "active",
    });

    const talentUser = await this.upsertUser({
      id: "talent-demo-id",
      role: "talent", 
      email: "talent@5t.com",
      firstName: "Sarah",
      lastName: "Johnson",
      status: "active",
    });

    const clientUser = await this.upsertUser({
      id: "client-demo-id",
      role: "client",
      email: "client@5t.com", 
      firstName: "Client",
      lastName: "User",
      status: "active",
    });

    // Create talent profile
    await this.createTalentProfile({
      userId: talentUser.id,
      stageName: "Sarah J.",
      categories: ["Commercial", "Runway", "Editorial"],
      skills: ["Acting", "Modeling", "Dance", "Spanish", "Yoga"],
      bio: "Professional model and actress with over 5 years of experience in fashion, commercial, and editorial work. Specializes in high-fashion runway shows and brand campaigns.",
      location: "New York, NY",
      unionStatus: "SAG-AFTRA",
      measurements: {
        height: "5'8\"",
        bust: "34\"",
        waist: "26\"",
        hips: "36\"",
        shoe: "8.5",
        hair: "Brown",
        eyes: "Hazel",
      },
      rates: {
        day: 800,
        halfDay: 500,
        hourly: 125,
      },
      social: {
        instagram: "@sarahjmodel",
      },
      approvalStatus: "approved",
    });

    // Create demo booking
    const demoBooking = await this.createBooking({
      clientId: clientUser.id,
      title: "Brand X Spring Campaign",
      location: "New York Studio",
      startDate: new Date("2024-03-15"),
      endDate: new Date("2024-03-17"),
      rate: "3200.00",
      status: "signed",
      createdBy: adminUser.id,
      notes: "Fashion campaign for spring collection",
    });

    // Add talent to booking
    await this.addTalentToBooking(demoBooking.id, talentUser.id);

    // Create demo tasks
    await this.createTask({
      scope: "booking",
      bookingId: demoBooking.id,
      title: "Review talent contracts for March shoots",
      description: "Ensure all contracts are signed and filed",
      status: "todo",
      assigneeId: adminUser.id,
      createdBy: adminUser.id,
      dueAt: new Date("2024-03-14"),
    });

    await this.createTask({
      scope: "talent",
      talentId: talentUser.id,
      title: "Update portfolio photos",
      description: "Add recent headshots to portfolio",
      status: "in_progress",
      assigneeId: talentUser.id,
      createdBy: adminUser.id,
    });

    console.log("Demo data seeded successfully");
  }
}

export const storage = new DatabaseStorage();
