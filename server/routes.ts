import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { z } from "zod";
import { insertTalentProfileSchema, insertBookingSchema, insertTaskSchema } from "@shared/schema";

// Placeholder for DB and schema imports (assuming they exist elsewhere)
// import { db, users, talentProfiles, eq } from "./db"; // Example import
// import crypto from "crypto"; // Example import

// Mock DB and schema for demonstration purposes if not provided
const mockDb = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve([]),
      }),
    }),
  }),
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([{ id: "mock-uuid", email: "mock@example.com", role: "talent", status: "active", firstName: "Mock", lastName: "User" }]),
    }),
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([{ id: "mock-uuid", userId: "mock-uuid", stageName: "Mock Talent", approvalStatus: "pending" }]),
      }),
    }),
  }),
};

const mockUsers = {
  email: "email",
};
const mockTalentProfiles = {
  userId: "userId",
  stageName: "stageName",
  location: "location",
  bio: "bio",
  categories: "categories",
  skills: "skills",
  phoneNumber: "phoneNumber",
  height: "height",
  weight: "weight",
  hairColor: "hairColor",
  eyeColor: "eyeColor",
  experience: "experience",
  approvalStatus: "approvalStatus",
  profileImageUrls: "profileImageUrls",
  portfolioUrls: "portfolioUrls"
};
const mockEq = (a: any, b: any) => a === b;
const mockCrypto = {
  randomUUID: () => "mock-uuid"
};

const db = mockDb;
const users = mockUsers;
const talentProfiles = mockTalentProfiles;
const eq = mockEq;
const crypto = mockCrypto;


export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed demo data on startup
  try {
    await storage.seedDemoData();
  } catch (error) {
    console.error("Failed to seed demo data:", error);
  }

  // Auth routes - using Replit Auth only

  // User endpoint to get current user info
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user doesn't exist, create them from Replit Auth claims
      if (!user) {
        const claims = req.user.claims;
        user = await storage.upsertUser({
          id: userId,
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
          role: 'talent', // Default to talent role
          status: 'active'
        });

        // Create initial talent profile for new users
        try {
          await storage.createTalentProfile({
            userId: user.id,
            stageName: `${user.firstName} ${user.lastName}`,
            categories: [],
            skills: [],
            bio: null,
            location: null,
            unionStatus: null,
            measurements: null,
            rates: null,
            mediaUrls: [],
            resumeUrls: [],
            social: null,
            guardian: null,
            approvalStatus: "pending"
          });
        } catch (error) {
          console.log("Initial talent profile already exists or error creating:", error);
        }
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Route to switch user role for testing
  app.post('/api/auth/switch-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;

      if (!role || !['admin', 'talent', 'client'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'admin', 'talent', or 'client'" });
      }

      // Update user role in database
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        role: role,
      });

      res.json({ message: `Role switched to ${role}`, user: updatedUser });
    } catch (error) {
      console.error("Error switching user role:", error);
      res.status(500).json({ message: "Failed to switch role" });
    }
  });

  // Object storage routes
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Talent routes
  app.get('/api/talents', async (req, res) => {
    try {
      const { 
        category, 
        skills, 
        location, 
        search, 
        page = "1", 
        limit = "20" 
      } = req.query;

      const skillsArray = skills ? (Array.isArray(skills) ? skills : [skills]) : undefined;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const result = await storage.getAllTalents({
        category: category as string,
        skills: skillsArray as string[],
        location: location as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset,
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching talents:", error);
      res.status(500).json({ message: "Failed to fetch talents" });
    }
  });

  app.get('/api/talents/:id', async (req, res) => {
    try {
      const id = req.params.id;
      let user = null;
      let profile = null;

      // First try to get talent profile by talent profile ID
      try {
        const allTalents = await storage.getAllTalents({ limit: 1000 });
        const talent = allTalents.talents.find(t => t.id === id);
        if (talent) {
          profile = talent;
          user = talent.user;
        }
      } catch (err) {
        // If not found by talent profile ID, try by user ID
        user = await storage.getUser(id);
        if (user && user.role === 'talent') {
          profile = await storage.getTalentProfile(id);
        }
      }

      if (!user || user.role !== 'talent') {
        return res.status(404).json({ message: "Talent not found" });
      }

      if (!profile || profile.approvalStatus !== 'approved') {
        return res.status(404).json({ message: "Talent profile not found or not approved" });
      }

      res.json({ ...profile, user });
    } catch (error) {
      console.error("Error fetching talent:", error);
      res.status(500).json({ message: "Failed to fetch talent" });
    }
  });

  app.post('/api/talents/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'talent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const profileData = insertTalentProfileSchema.parse({
        ...req.body,
        userId,
      });

      const existingProfile = await storage.getTalentProfile(userId);
      let profile;

      if (existingProfile) {
        profile = await storage.updateTalentProfile(userId, profileData);
      } else {
        profile = await storage.createTalentProfile(profileData);
      }

      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating talent profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put("/api/talents/me/media", isAuthenticated, async (req: any, res) => {
    if (!req.body.mediaUrl) {
      return res.status(400).json({ error: "mediaUrl is required" });
    }

    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);

    if (!user || user.role !== 'talent') {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.mediaUrl,
        {
          owner: userId,
          visibility: "public", // Talent media is public for directory viewing
        },
      );

      // Update talent profile with new media URL
      const profile = await storage.getTalentProfile(userId);
      if (profile) {
        const mediaUrls = [...(profile.mediaUrls || []), objectPath];
        await storage.updateTalentProfile(userId, { mediaUrls });
      }

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting talent media:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin endpoints for creating users and talents
  app.post("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { firstName, lastName, email, role, status } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const newUser = await storage.upsertUser({
        id: Math.random().toString(36).substring(2, 15),
        firstName,
        lastName,
        email,
        role: role as "admin" | "talent" | "client",
        status: status || "active",
        profileImageUrl: null
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/talents/admin-create", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminUserId);

      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const profileData = insertTalentProfileSchema.parse(req.body);
      const profile = await storage.createTalentProfile(profileData);

      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating talent profile:", error);
      res.status(500).json({ message: "Failed to create talent profile" });
    }
  });

  app.patch('/api/admin/talents/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const profile = await storage.approveTalent(req.params.id, status);
      res.json(profile);
    } catch (error) {
      console.error("Error approving talent:", error);
      res.status(500).json({ message: "Failed to approve talent" });
    }
  });

  // Booking routes
  app.post('/api/bookings', async (req, res) => {
    try {
      let bookingData;
      let createdBy = req.body.createdBy;

      // Check if user is authenticated (admin creating booking) or public inquiry
      if (req.user) {
        const user = await storage.getUser((req.user as any).claims.sub);
        if (user && user.role === 'admin') {
          createdBy = user.id;
        }
      }

      // If no createdBy, this is a public inquiry - create a basic client user
      if (!createdBy && req.body.clientEmail) {
        const clientData = {
          role: "client" as const,
          email: req.body.clientEmail,
          firstName: req.body.clientName?.split(' ')[0] || "Client",
          lastName: req.body.clientName?.split(' ').slice(1).join(' ') || "User",
        };

        let client = await storage.getUser(clientData.email!); // Use email as ID for demo
        if (!client) {
          client = await storage.upsertUser(clientData);
        }

        createdBy = client.id;
        bookingData = insertBookingSchema.parse({
          ...req.body,
          clientId: client.id,
          createdBy: client.id,
        });
      } else {
        bookingData = insertBookingSchema.parse(req.body);
      }

      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { 
        status, 
        talentId, 
        page = "1", 
        limit = "20" 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let options: any = {
        limit: parseInt(limit as string),
        offset,
      };

      // Filter based on user role
      if (user.role === 'talent') {
        options.talentId = userId;
      } else if (user.role === 'client') {
        options.clientId = userId;
      } else if (user.role === 'admin') {
        if (status) options.status = status;
        if (talentId) options.talentId = talentId;
      }

      const result = await storage.getAllBookings(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check access permissions
      const hasAccess = user.role === 'admin' || 
                       booking.clientId === userId ||
                       booking.bookingTalents.some(bt => bt.talentId === userId);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.patch('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const booking = await storage.updateBooking(req.params.id, req.body);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.post('/api/bookings/:id/add-talent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { talentId } = req.body;
      const bookingTalent = await storage.addTalentToBooking(req.params.id, talentId);
      res.json(bookingTalent);
    } catch (error) {
      console.error("Error adding talent to booking:", error);
      res.status(500).json({ message: "Failed to add talent to booking" });
    }
  });

  // Task routes
  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { 
        bookingId, 
        talentId, 
        status, 
        page = "1", 
        limit = "20" 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let options: any = {
        limit: parseInt(limit as string),
        offset,
      };

      // Filter based on user role
      if (user.role === 'talent') {
        options.talentId = userId;
      } else if (user.role === 'admin') {
        if (bookingId) options.bookingId = bookingId;
        if (talentId) options.talentId = talentId;
        if (status) options.status = status;
      }

      const result = await storage.getAllTasks(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only admin or assigned user can update tasks
      if (user.role !== 'admin' && req.body.assigneeId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const task = await storage.updateTask(req.params.id, req.body);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Calendar routes
  app.get('/api/calendar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { bookings } = await storage.getAllBookings({ limit: 100 });

      const events = bookings
        .filter(booking => booking.status === 'signed' || booking.status === 'paid')
        .map(booking => ({
          id: booking.id,
          title: booking.title,
          start: booking.startDate,
          end: booking.endDate,
          bookingId: booking.id,
          talentIds: booking.bookingTalents.map(bt => bt.talentId),
        }));

      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar:", error);
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}