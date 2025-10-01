import {
  users,
  talentProfiles,
  bookings,
  bookingTalents,
  tasks,
  announcements,
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
  type Announcement,
  type InsertAnnouncement,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: { email: string; password: string; firstName: string; lastName: string; role: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserStatus(id: string, status: string): Promise<User>;
  getPendingUsers(): Promise<User[]>;
  getAdminUsers(): Promise<User[]>;

  // Talent operations
  getTalentProfile(userId: string): Promise<TalentProfile | undefined>;
  createTalentProfile(profile: InsertTalentProfile): Promise<TalentProfile>;
  updateTalentProfile(userId: string, profile: Partial<InsertTalentProfile>): Promise<TalentProfile>;
  getAllTalents(options?: {
    category?: string;
    skills?: string[];
    location?: string;
    search?: string;
    approvalStatus?: string;
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
  
  // Booking request operations
  getPendingBookingRequests(talentId: string): Promise<(BookingTalent & { booking: Booking & { client: User } })[]>;
  getAllBookingRequests(options?: { status?: string; limit?: number }): Promise<(BookingTalent & { booking: Booking; talent: TalentProfile & { user: User } })[]>;
  respondToBookingRequest(requestId: string, talentId: string, status: 'accepted' | 'declined', message?: string): Promise<BookingTalent>;

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
  deleteTask(id: string): Promise<void>;

  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAllAnnouncements(options?: {
    category?: string;
    search?: string;
    published?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ announcements: (Announcement & { createdBy: User })[], total: number }>;
  getAnnouncement(id: string): Promise<(Announcement & { createdBy: User }) | undefined>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;

  // Demo data seeding
  seedDemoData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async createUser(userData: { email: string; password: string; firstName: string; lastName: string; role: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role as any,
        status: "pending", // Explicitly set status to pending for new users
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        role: role as any,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStatus(id: string, status: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getPendingUsers(): Promise<User[]> {
    console.log("DEBUG: Querying for pending users...");
    
    // First, let's see all users and their statuses
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    console.log("DEBUG: All users in database:", allUsers.map(u => ({ 
      id: u.id, 
      email: u.email, 
      firstName: u.firstName, 
      lastName: u.lastName, 
      status: u.status, 
      createdAt: u.createdAt 
    })));
    
    const pendingUsers = await db
      .select()
      .from(users)
      .where(eq(users.status, "pending"))
      .orderBy(users.createdAt);
    
    console.log("DEBUG: Pending users found:", pendingUsers.length);
    console.log("DEBUG: Pending users details:", pendingUsers.map(u => ({ 
      id: u.id, 
      email: u.email, 
      firstName: u.firstName, 
      lastName: u.lastName, 
      status: u.status 
    })));
    
    // Remove passwords from all users
    return pendingUsers.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async getAdminUsers(): Promise<User[]> {
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"))
      .orderBy(users.createdAt);
    
    // Remove passwords from all users
    return adminUsers.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
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
    // First get the existing profile
    const existing = await this.getTalentProfile(userId);
    if (!existing) {
      throw new Error("Talent profile not found");
    }

    // Only update fields that are actually provided (not undefined)
    const updateData: any = { updatedAt: new Date() };
    
    // Handle each field carefully to preserve existing data
    Object.keys(profile).forEach(key => {
      const value = (profile as any)[key];
      if (value !== undefined) {
        if (key === 'measurements' && typeof value === 'object') {
          // Merge measurements object
          updateData[key] = { ...existing.measurements, ...value };
        } else if (key === 'rates' && typeof value === 'object') {
          // Merge rates object  
          updateData[key] = { ...existing.rates, ...value };
        } else if (key === 'social' && typeof value === 'object') {
          // Merge social object
          updateData[key] = { ...existing.social, ...value };
        } else if (key === 'guardian' && typeof value === 'object') {
          // Merge guardian object
          updateData[key] = { ...existing.guardian, ...value };
        } else {
          // For simple fields, just update if provided
          updateData[key] = value;
        }
      }
    });

    const [updated] = await db
      .update(talentProfiles)
      .set(updateData)
      .where(eq(talentProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getAllTalents(options: {
    category?: string;
    skills?: string[];
    location?: string;
    search?: string;
    approvalStatus?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ talents: (TalentProfile & { user: User })[], total: number }> {
    const {
      category,
      skills,
      location,
      search,
      approvalStatus = "approved", // Default to approved for public talent directory
      limit = 20,
      offset = 0,
    } = options;

    const conditions = [eq(talentProfiles.approvalStatus, approvalStatus as "pending" | "approved" | "rejected")];

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
      createdBy: createdBy,
      bookingTalents: bookingTalentsResult.map(row => ({ ...row.booking_talents, talent: row.users })),
    } as any;
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
      query = query.where(and(...conditions)) as any;
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
          createdBy: createdBy,
          bookingTalents: bookingTalentsResult.map(btRow => ({ ...btRow.booking_talents, talent: btRow.users })),
        } as any;
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

  async getPendingBookingRequests(talentId: string): Promise<(BookingTalent & { booking: Booking & { client: User } })[]> {
    const requests = await db
      .select({
        id: bookingTalents.id,
        bookingId: bookingTalents.bookingId,
        talentId: bookingTalents.talentId,
        requestStatus: bookingTalents.requestStatus,
        responseMessage: bookingTalents.responseMessage,
        respondedAt: bookingTalents.respondedAt,
        createdAt: bookingTalents.createdAt,
        booking: bookings,
        client: users,
      })
      .from(bookingTalents)
      .innerJoin(bookings, eq(bookingTalents.bookingId, bookings.id))
      .innerJoin(users, eq(bookings.clientId, users.id))
      .where(
        and(
          eq(bookingTalents.talentId, talentId),
          eq(bookingTalents.requestStatus, 'pending')
        )
      )
      .orderBy(desc(bookingTalents.createdAt));

    return requests.map(r => ({
      id: r.id,
      bookingId: r.bookingId,
      talentId: r.talentId,
      requestStatus: r.requestStatus,
      responseMessage: r.responseMessage,
      respondedAt: r.respondedAt,
      createdAt: r.createdAt,
      booking: {
        ...r.booking,
        client: r.client,
      },
    }));
  }

  async getAllBookingRequests(options: { status?: string; limit?: number } = {}): Promise<(BookingTalent & { booking: Booking; talent: TalentProfile & { user: User } })[]> {
    const { status = 'pending', limit = 10 } = options;
    
    const requests = await db
      .select({
        id: bookingTalents.id,
        bookingId: bookingTalents.bookingId,
        talentId: bookingTalents.talentId,
        requestStatus: bookingTalents.requestStatus,
        responseMessage: bookingTalents.responseMessage,
        respondedAt: bookingTalents.respondedAt,
        createdAt: bookingTalents.createdAt,
        booking: bookings,
        talent: talentProfiles,
        user: users,
      })
      .from(bookingTalents)
      .innerJoin(bookings, eq(bookingTalents.bookingId, bookings.id))
      .innerJoin(talentProfiles, eq(bookingTalents.talentId, talentProfiles.userId))
      .innerJoin(users, eq(talentProfiles.userId, users.id))
      .where(eq(bookingTalents.requestStatus, status as "pending" | "accepted" | "declined"))
      .orderBy(desc(bookingTalents.createdAt))
      .limit(limit);

    return requests.map(r => ({
      id: r.id,
      bookingId: r.bookingId,
      talentId: r.talentId,
      requestStatus: r.requestStatus,
      responseMessage: r.responseMessage,
      respondedAt: r.respondedAt,
      createdAt: r.createdAt,
      booking: r.booking,
      talent: {
        ...r.talent,
        user: r.user,
      },
    }));
  }

  async respondToBookingRequest(requestId: string, talentId: string, status: 'accepted' | 'declined', message?: string): Promise<BookingTalent> {
    const [updated] = await db
      .update(bookingTalents)
      .set({
        requestStatus: status,
        responseMessage: message,
        respondedAt: new Date(),
      })
      .where(
        and(
          eq(bookingTalents.id, requestId),
          eq(bookingTalents.talentId, talentId)
        )
      )
      .returning();

    if (!updated) {
      throw new Error("Booking request not found or access denied");
    }

    // If talent accepted, trigger contract creation notification
    if (status === 'accepted') {
      // This will be handled by the route handler to send admin notification
      console.log(`Talent accepted booking request ${requestId} - admin should be notified to create contract`);
    }

    return updated;
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
      query = query.where(and(...conditions)) as any;
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

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Announcement operations
  async createAnnouncement(announcementData: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getAllAnnouncements(options?: {
    category?: string;
    search?: string;
    published?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ announcements: (Announcement & { createdBy: User })[], total: number }> {
    let query = db
      .select({
        announcement: announcements,
        createdBy: users,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdBy, users.id))
      .orderBy(desc(announcements.createdAt));

    const conditions = [];

    if (options?.category) {
      conditions.push(eq(announcements.category, options.category as any));
    }

    if (options?.published !== undefined) {
      conditions.push(eq(announcements.published, options.published));
    }

    if (options?.search) {
      conditions.push(
        sql`${announcements.title} ILIKE ${`%${options.search}%`} OR ${announcements.description} ILIKE ${`%${options.search}%`}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    const totalQuery = db
      .select({ count: sql`count(*)` })
      .from(announcements);

    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }

    const [totalResult] = await totalQuery;
    const total = Number(totalResult.count);

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const results = await query;

    const announcementsWithCreatedBy = results.map(row => ({
      ...row.announcement,
      createdBy: row.createdBy!,
    }));

    return {
      announcements: announcementsWithCreatedBy,
      total,
    };
  }

  async getAnnouncement(id: string): Promise<(Announcement & { createdBy: User }) | undefined> {
    const [result] = await db
      .select({
        announcement: announcements,
        createdBy: users,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdBy, users.id))
      .where(eq(announcements.id, id));

    if (!result) return undefined;

    return {
      ...result.announcement,
      createdBy: result.createdBy!,
    };
  }

  async updateAnnouncement(id: string, announcementData: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [announcement] = await db
      .update(announcements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id))
      .returning();

    return announcement;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  async seedDemoData(): Promise<void> {
    // Clear existing data first to ensure fresh seed with proper passwords
    // Clear talent profiles first due to foreign key constraints
    await db.delete(talentProfiles);
    await db.delete(bookingTalents);
    await db.delete(bookings);
    await db.delete(users);
    console.log("Cleared existing data for fresh seed");

    console.log("Seeding demo data...");

    // Import hash function (we'll import it at the top of the file)
    const { hashPassword } = await import("./auth");

    // Create demo users with passwords
    const adminUser = await this.createUser({
      email: "admin@5t.com",
      password: await hashPassword("admin123"),
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    // Create demo talent users first
    const sarahUser = await this.createUser({
      email: "sarah@5t.com",
      password: await hashPassword("sarah123"),
      firstName: "Sarah",
      lastName: "Chen", 
      role: "talent",
    });

    const marcusUser = await this.createUser({
      email: "marcus@5t.com", 
      password: await hashPassword("marcus123"),
      firstName: "Marcus",
      lastName: "Rodriguez",
      role: "talent",
    });

    const elenaUser = await this.createUser({
      email: "elena@5t.com",
      password: await hashPassword("elena123"), 
      firstName: "Elena",
      lastName: "Castillo",
      role: "talent",
    });

    // Create Bobby Craig talent user for testing
    const bobbyUser = await this.createUser({
      email: "bobby@5t.com",
      password: await hashPassword("bobby123"),
      firstName: "Bobby",
      lastName: "Craig",
      role: "talent",
    });

    // Create a demo client user
    const clientUser = await this.createUser({
      email: "client@5t.com",
      password: await hashPassword("client123"),
      firstName: "John",
      lastName: "Client",
      role: "client",
    });

    // Create talent profiles
    await this.createTalentProfile({
      userId: sarahUser.id,
      stageName: "Sarah J.",
      categories: ["Commercial", "Runway", "Editorial"],
      skills: ["Acting", "Modeling", "Dance", "Spanish", "Yoga"],
      bio: "Professional model and actress with over 5 years of experience in fashion, commercial, and editorial work. Specializes in high-fashion runway shows and brand campaigns.",
      location: "New York, NY",
      unionStatus: "SAG-AFTRA",
      measurements: {
        height: "5'8\"",
        weight: "",
        bust: "34\"",
        waist: "26\"",
        hips: "36\"",
        shoe: "8.5",
        hair: "Brown",
        eyes: "Hazel"
      },
      rates: {
        hourly: 125,
        halfDay: 500,
        day: 800
      },
      social: {
        instagram: "@sarahjmodel"
      },
      approvalStatus: "approved",
    });

    await this.createTalentProfile({
      userId: marcusUser.id,
      stageName: "Marcus R.",
      categories: ["Commercial", "Print", "Fitness"],
      skills: ["Fitness Modeling", "Acting", "Stunt Work", "Boxing", "Swimming"],
      bio: "Athletic model and actor specializing in fitness, sports, and action roles. Former professional athlete with extensive experience in commercial campaigns and fitness brands.",
      location: "Los Angeles, CA",
      unionStatus: "SAG-AFTRA",
      measurements: {
        height: "6'2\"",
        weight: "185 lbs",
        chest: "42\"",
        waist: "32\"",
        shoe: "11",
        hair: "Black",
        eyes: "Brown"
      },
      rates: {
        hourly: 150,
        halfDay: 600,
        day: 950
      },
      social: {
        instagram: "@marcusfitmodel"
      },
      approvalStatus: "approved",
    });

    await this.createTalentProfile({
      userId: elenaUser.id,
      stageName: "Elena C.",
      categories: ["Editorial", "High Fashion", "Beauty"],
      skills: ["Runway", "Editorial", "Beauty", "Fashion", "Posing"],
      bio: "High fashion model with international runway experience. Featured in major fashion magazines and campaigns for luxury brands. Specializes in avant-garde and editorial work.",
      location: "Miami, FL",
      unionStatus: "Non-Union",
      measurements: {
        height: "5'10\"",
        weight: "",
        bust: "32\"",
        waist: "24\"",
        hips: "34\"",
        shoe: "9",
        hair: "Dark Brown",
        eyes: "Brown"
      },
      rates: {
        hourly: 175,
        halfDay: 700,
        day: 1200
      },
      social: {
        instagram: "@elenacouture"
      },
      approvalStatus: "approved",
    });

    // Create Bobby Craig talent profile for testing
    await this.createTalentProfile({
      userId: bobbyUser.id,
      stageName: "Bobby Craig",
      categories: ["Commercial", "On-Camera", "Corporate"],
      skills: ["Acting", "Voice Acting", "Presenting", "Comedy"],
      bio: "Versatile talent with experience in commercial acting, corporate presentations, and voice work. Professional, reliable, and great with client direction.",
      location: "New York, NY",
      unionStatus: "SAG-AFTRA",
      measurements: {
        height: "5'11\"",
        weight: "175 lbs",
        hair: "Brown",
        eyes: "Brown"
      },
      rates: {
        hourly: 150,
        halfDay: 600,
        day: 1000
      },
      social: {
        instagram: "@bobbycraig"
      },
      approvalStatus: "approved",
    });

    console.log("Demo data seeded successfully!");
  }
}

export const storage = new DatabaseStorage();
