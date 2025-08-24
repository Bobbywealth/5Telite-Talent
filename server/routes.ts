import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import express from "express";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertTalentProfileSchema,
  insertBookingSchema,
  insertTaskSchema,
} from "@shared/schema";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { ContractService } from "./contractService";
import { db } from "./db";
import { bookings, users, talentProfiles, bookingTalents } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from attached_assets
  app.use('/attached_assets', express.static(path.resolve(process.cwd(), 'attached_assets')));
  
  // Auth middleware
  await setupAuth(app);

  // Seed demo data if needed
  app.post('/api/seed', async (req, res) => {
    try {
      await storage.seedDemoData();
      res.json({ message: "Demo data seeded successfully" });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ message: "Failed to seed demo data" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, email, phone } = req.body;

      const updates = { firstName, lastName, email, phone };
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the user data (this would need to be implemented in storage)
      const updatedUser = { ...user, ...updates };
      await storage.upsertUser(updatedUser);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Role switching for testing purposes
  app.post('/api/auth/switch-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;

      if (!role || !['admin', 'talent', 'client'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      res.json({ message: "Role switched successfully", user: updatedUser });
    } catch (error) {
      console.error("Error switching role:", error);
      res.status(500).json({ message: "Failed to switch role" });
    }
  });

  // User role management (placeholder - not implemented in storage yet)
  app.patch('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);

      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // This feature would require additional storage methods
      res.status(501).json({ message: "Feature not yet implemented" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Object storage routes
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
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
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Talent routes
  app.get('/api/talents', async (req, res) => {
    try {
      const { 
        category, 
        skills, 
        location, 
        search, 
        approvalStatus,
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
        approvalStatus: approvalStatus as string,
        limit: parseInt(limit as string),
        offset,
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching talents:", error);
      res.status(500).json({ message: "Failed to fetch talents" });
    }
  });

  // Dashboard endpoint for talent users
  app.get('/api/talents/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'talent') {
        return res.status(403).json({ message: "Talent access required" });
      }

      // Get talent profile (may not exist yet)
      let profile = null;
      try {
        profile = await storage.getTalentProfile(userId);
      } catch (error) {
        // Profile doesn't exist yet, that's fine
      }

      res.json({ user, talentProfile: profile });
    } catch (error) {
      console.error("Error fetching talent dashboard:", error);
      res.status(500).json({ message: "Failed to fetch talent dashboard" });
    }
  });

  app.get('/api/talents/:id', async (req: any, res) => {
    try {
      const id = req.params.id;
      const requestingUserId = req.user?.claims?.sub;
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
          try {
            profile = await storage.getTalentProfile(id);
          } catch (error) {
            // Profile doesn't exist yet
          }
        }
      }

      if (!user || user.role !== 'talent') {
        return res.status(404).json({ message: "Talent not found" });
      }

      // If requesting their own profile, always allow access
      if (requestingUserId === id) {
        return res.json({ ...profile, user, talentProfile: profile });
      }

      // For public viewing, only show approved profiles
      if (!profile || profile.approvalStatus !== 'approved') {
        return res.status(404).json({ message: "Talent profile not found or not approved" });
      }

      res.json({ ...profile, user });
    } catch (error) {
      console.error("Error fetching talent:", error);
      res.status(500).json({ message: "Failed to fetch talent" });
    }
  });

  app.post('/api/talents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'talent') {
        return res.status(403).json({ message: "Talent access required" });
      }

      // Check if profile already exists
      const existingProfile = await storage.getTalentProfile(userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Talent profile already exists" });
      }

      const profileData = insertTalentProfileSchema.parse({
        ...req.body,
        userId,
        approvalStatus: 'pending'
      });

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

  app.patch('/api/talents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const targetUserId = req.params.id;

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only the talent themselves or admin can update
      if (user.role !== 'admin' && userId !== targetUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const profileData = req.body;
      
      // If admin is updating, preserve the approval status unless specifically changing it
      if (user.role === 'admin' && !profileData.hasOwnProperty('approvalStatus')) {
        const existingProfile = await storage.getTalentProfile(targetUserId);
        if (existingProfile) {
          profileData.approvalStatus = existingProfile.approvalStatus;
        }
      } else if (user.role !== 'admin') {
        // Non-admin users cannot change approval status
        delete profileData.approvalStatus;
      }

      // Handle media URL uploads with ACL
      if (profileData.mediaUrls) {
        const objectStorageService = new ObjectStorageService();
        for (const mediaUrl of profileData.mediaUrls) {
          try {
            await objectStorageService.trySetObjectEntityAclPolicy(mediaUrl, {
              owner: userId,
              visibility: "public", // Profile media should be public for viewing
            });
          } catch (error) {
            console.error("Error setting ACL for media URL:", mediaUrl, error);
          }
        }
      }

      const profile = await storage.updateTalentProfile(targetUserId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating talent profile:", error);
      res.status(500).json({ message: "Failed to update talent profile" });
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
      
      if (req.body.talents && Array.isArray(req.body.talents)) {
        // Handle multiple talents
        const { talents, ...bookingInfo } = req.body;
        bookingData = insertBookingSchema.parse(bookingInfo);
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

  // Send booking requests to talents (placeholder)
  app.post('/api/bookings/:id/send-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // This feature would require additional storage methods
      res.status(501).json({ message: "Feature not yet implemented" });
    } catch (error) {
      console.error("Error sending booking requests:", error);
      res.status(500).json({ message: "Failed to send booking requests" });
    }
  });

  // Get booking requests for talent, admin, or client
  app.get('/api/booking-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || !['talent', 'admin', 'client'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      let requests;
      if (user.role === 'admin') {
        // Admins can see all pending booking requests (limited for dashboard)
        const { status = 'pending', limit } = req.query;
        requests = await storage.getAllBookingRequests({ 
          status: status as string,
          limit: limit ? parseInt(limit as string) : undefined 
        });
      } else if (user.role === 'talent') {
        // Talents only see their own requests
        requests = await storage.getPendingBookingRequests(userId);
      } else if (user.role === 'client') {
        // Clients see booking requests for their own bookings
        const clientBookings = await storage.getAllBookings({ clientId: userId });
        // For now, return empty array for clients until we add booking request filtering by client
        requests = [];
      }
      
      res.json({ requests });
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      res.status(500).json({ message: "Failed to fetch booking requests" });
    }
  });

  // Respond to booking request (accept/decline)
  app.patch('/api/booking-requests/:requestId/respond', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'talent') {
        return res.status(403).json({ message: "Talent access required" });
      }

      const { action, message } = req.body; // action: 'accept' or 'decline'
      
      if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ message: "Action must be 'accept' or 'decline'" });
      }

      const result = await storage.respondToBookingRequest(
        req.params.requestId, 
        userId, 
        action === 'accept' ? 'accepted' : 'declined',
        message
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error responding to booking request:", error);
      res.status(500).json({ message: "Failed to respond to booking request" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { 
        bookingId,
        status,
        assigneeId,
        page = "1", 
        limit = "20" 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let options: any = {
        limit: parseInt(limit as string),
        offset,
      };

      // Set filters based on query params and user role
      if (bookingId) options.bookingId = bookingId;
      if (status) options.status = status;
      
      // Role-based filtering
      if (user.role === 'admin') {
        if (assigneeId) options.assigneeId = assigneeId;
      } else {
        // Non-admin users only see tasks assigned to them
        options.assigneeId = userId;
      }

      const result = await storage.getAllTasks(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const taskData = insertTaskSchema.parse(req.body);
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

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Users can only update tasks assigned to them, admins can update any task
      if (user.role !== 'admin') {
        // Check if task is assigned to this user
        const tasks = await storage.getAllTasks({ assigneeId: userId });
        const task = tasks.tasks.find(t => t.id === req.params.id);
        if (!task) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const updatedTask = await storage.updateTask(req.params.id, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Notifications endpoint
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let notifications: any[] = [];
      let total = 0;

      if (user.role === 'admin') {
        // Admin notifications: pending approvals, booking requests, tasks, etc.
        
        // 1. Pending talent approvals
        const pendingTalents = await storage.getAllTalents({ 
          approvalStatus: 'pending', 
          limit: 100 
        });
        if (pendingTalents.talents.length > 0) {
          notifications.push({
            type: 'approval',
            title: `${pendingTalents.talents.length} talent${pendingTalents.talents.length > 1 ? 's' : ''} awaiting approval`,
            description: `New talent applications need your review`,
            createdAt: pendingTalents.talents[0]?.createdAt ? new Date(pendingTalents.talents[0].createdAt) : new Date(),
            badge: pendingTalents.talents.length.toString(),
          });
        }

        // 2. Pending booking requests
        const pendingBookingRequests = await storage.getAllBookingRequests({ 
          status: 'pending', 
          limit: 50 
        });
        if (pendingBookingRequests.length > 0) {
          notifications.push({
            type: 'booking',
            title: `${pendingBookingRequests.length} booking request${pendingBookingRequests.length > 1 ? 's' : ''} pending`,
            description: 'Talents are waiting for booking confirmations',
            createdAt: pendingBookingRequests[0]?.createdAt ? new Date(pendingBookingRequests[0].createdAt) : new Date(),
            badge: pendingBookingRequests.length.toString(),
          });
        }

        // 3. Pending tasks
        const adminTasks = await storage.getAllTasks({ 
          assigneeId: userId, 
          status: 'todo', 
          limit: 50 
        });
        if (adminTasks.tasks.length > 0) {
          notifications.push({
            type: 'task',
            title: `${adminTasks.tasks.length} pending task${adminTasks.tasks.length > 1 ? 's' : ''}`,
            description: 'Tasks assigned to you need attention',
            createdAt: adminTasks.tasks[0]?.createdAt ? new Date(adminTasks.tasks[0].createdAt) : new Date(),
            badge: adminTasks.tasks.length.toString(),
          });
        }

        // 4. Recent bookings (last 24 hours)
        const recentBookings = await storage.getAllBookings({ 
          limit: 10
        });
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const newBookings = recentBookings.bookings.filter(
          booking => booking.createdAt && new Date(booking.createdAt) > yesterday
        );
        if (newBookings.length > 0) {
          notifications.push({
            type: 'booking',
            title: `${newBookings.length} new booking${newBookings.length > 1 ? 's' : ''} created`,
            description: 'Recent bookings may need attention',
            createdAt: newBookings[0]?.createdAt ? new Date(newBookings[0].createdAt!) : new Date(),
            badge: 'New',
          });
        }

      } else if (user.role === 'talent') {
        // Talent notifications: booking requests, tasks, messages, etc.
        
        // 1. Pending booking requests sent to this talent
        const talentBookingRequests = await storage.getPendingBookingRequests(userId);
        if (talentBookingRequests.length > 0) {
          notifications.push({
            type: 'booking',
            title: `${talentBookingRequests.length} booking request${talentBookingRequests.length > 1 ? 's' : ''} awaiting response`,
            description: 'Clients are waiting for your response',
            createdAt: talentBookingRequests[0]?.createdAt ? new Date(talentBookingRequests[0].createdAt) : new Date(),
            badge: talentBookingRequests.length.toString(),
          });
        }

        // 2. Tasks assigned to this talent
        const talentTasks = await storage.getAllTasks({ 
          assigneeId: userId, 
          status: 'todo', 
          limit: 50 
        });
        if (talentTasks.tasks.length > 0) {
          notifications.push({
            type: 'task', 
            title: `${talentTasks.tasks.length} pending task${talentTasks.tasks.length > 1 ? 's' : ''}`,
            description: 'Tasks assigned to you need completion',
            createdAt: talentTasks.tasks[0]?.createdAt ? new Date(talentTasks.tasks[0].createdAt) : new Date(),
            badge: talentTasks.tasks.length.toString(),
          });
        }

        // 3. Recent bookings this talent is involved in
        const talentBookings = await storage.getAllBookings({ 
          talentId: userId,
          limit: 10
        });
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const recentBookings = talentBookings.bookings.filter(
          booking => booking.createdAt && new Date(booking.createdAt) > yesterday
        );
        if (recentBookings.length > 0) {
          notifications.push({
            type: 'booking',
            title: `${recentBookings.length} booking update${recentBookings.length > 1 ? 's' : ''}`,
            description: 'Recent changes to your bookings',
            createdAt: recentBookings[0]?.createdAt ? new Date(recentBookings[0].createdAt!) : new Date(),
            badge: 'Update',
          });
        }

        // 4. Profile approval status
        const talentProfile = await storage.getTalentProfile(userId);
        if (talentProfile?.approvalStatus === 'pending') {
          notifications.push({
            type: 'approval',
            title: 'Profile under review',
            description: 'Your talent application is being reviewed by our team',
            createdAt: talentProfile.createdAt ? new Date(talentProfile.createdAt) : new Date(),
            badge: 'Pending',
          });
        } else if (talentProfile?.approvalStatus === 'rejected') {
          notifications.push({
            type: 'urgent',
            title: 'Profile needs attention',
            description: 'Your application was rejected. Please update and resubmit.',
            createdAt: talentProfile.updatedAt ? new Date(talentProfile.updatedAt) : new Date(),
            badge: 'Action Required',
          });
        }

      } else if (user.role === 'client') {
        // Client notifications: booking updates, task assignments, etc.
        
        // 1. Bookings created by this client
        const clientBookings = await storage.getAllBookings({ 
          clientId: userId,
          limit: 10
        });
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const recentBookings = clientBookings.bookings.filter(
          booking => booking.updatedAt && new Date(booking.updatedAt) > yesterday
        );
        if (recentBookings.length > 0) {
          notifications.push({
            type: 'booking',
            title: `${recentBookings.length} booking update${recentBookings.length > 1 ? 's' : ''}`,
            description: 'Recent updates to your bookings',
            createdAt: recentBookings[0]?.updatedAt ? new Date(recentBookings[0].updatedAt) : new Date(),
            badge: 'Update',
          });
        }

        // 2. Tasks assigned to this client
        const clientTasks = await storage.getAllTasks({ 
          assigneeId: userId, 
          status: 'todo', 
          limit: 50 
        });
        if (clientTasks.tasks.length > 0) {
          notifications.push({
            type: 'task',
            title: `${clientTasks.tasks.length} pending task${clientTasks.tasks.length > 1 ? 's' : ''}`,
            description: 'Tasks assigned to you need attention',
            createdAt: clientTasks.tasks[0]?.createdAt ? new Date(clientTasks.tasks[0].createdAt) : new Date(),
            badge: clientTasks.tasks.length.toString(),
          });
        }
      }

      // Sort notifications by most recent first
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Calculate total count
      total = notifications.reduce((sum, notif) => {
        const badgeNum = parseInt(notif.badge) || 1;
        return sum + (isNaN(badgeNum) ? 1 : badgeNum);
      }, 0);

      res.json({
        items: notifications.slice(0, 10), // Limit to 10 most recent
        total,
        role: user.role
      });

    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Contract routes
  app.get('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let contracts;
      if (user?.role === 'admin') {
        // Admin can see all contracts
        contracts = await db.query.contracts.findMany({
          with: {
            signatures: { with: { signer: true } },
            booking: true,
            bookingTalent: { with: { talent: true } },
          },
        });
      } else if (user?.role === 'talent') {
        // Talent can see contracts they need to sign
        contracts = await ContractService.getContractsForTalent(userId);
      } else {
        // Clients can see contracts for their bookings - get all for now
        contracts = await db.query.contracts.findMany({
          with: {
            signatures: { with: { signer: true } },
            booking: true,
            bookingTalent: { with: { talent: true } },
          },
        });
      }
      
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const contractId = req.params.id;
      const contract = await ContractService.getContractWithSignatures(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post('/api/contracts/:id/sign', isAuthenticated, async (req: any, res) => {
    try {
      const contractId = req.params.id;
      const userId = req.user.claims.sub;
      const { signatureData } = req.body;
      
      if (!signatureData) {
        return res.status(400).json({ message: "Signature data is required" });
      }
      
      // Get user agent and IP
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      
      await ContractService.signContract(
        contractId,
        userId,
        signatureData,
        ipAddress,
        userAgent
      );
      
      res.json({ message: "Contract signed successfully" });
    } catch (error) {
      console.error("Error signing contract:", error);
      res.status(500).json({ message: "Failed to sign contract" });
    }
  });

  app.post('/api/bookings/:bookingId/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user.claims.sub;
      const { bookingTalentId } = req.body;
      
      // Get booking details
      const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, bookingId),
        with: {
          client: true,
          bookingTalents: {
            where: eq(bookingTalents.id, bookingTalentId),
            with: {
              talent: {
                with: {
                  talentProfile: true,
                },
              },
            },
          },
        },
      });
      
      if (!booking || !booking.bookingTalents[0]) {
        return res.status(404).json({ message: "Booking or talent not found" });
      }
      
      const bookingTalent = booking.bookingTalents[0];
      const contractData = {
        booking,
        talent: bookingTalent.talent,
        talentProfile: bookingTalent.talent.talentProfile,
        client: booking.client,
      };
      
      const contract = await ContractService.createContract(
        bookingId,
        bookingTalentId,
        userId,
        contractData
      );
      
      res.json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}