import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import express from "express";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import {
  insertTalentProfileSchema,
  insertBookingSchema,
  insertTaskSchema,
  insertAnnouncementSchema,
} from "@shared/schema";
// Object storage imports removed - now using Google Cloud Storage
import { ObjectPermission } from "./objectAcl";
import { ContractService } from "./contractService";
import { emailService } from "./emailService";
import { enhancedEmailService } from "./emailServiceEnhanced";
import { NotificationService } from "./notificationService";
import { db } from "./db";
import { bookings, users, talentProfiles, bookingTalents, contracts, signatures, tasks, notifications, loginActivity } from "@shared/schema";
import { eq, sql, and, desc, or, like } from "drizzle-orm";
import filesRouter from './routes/files';

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from attached_assets
  app.use('/attached_assets', express.static(path.resolve(process.cwd(), 'attached_assets')));
  
  // Auth middleware
  await setupAuth(app);

  // Mount files router
  app.use('/api/files', filesRouter);

  // Admin endpoint to approve/reject users
  app.patch('/api/admin/users/:userId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const { status } = req.body;
      const adminUser = await storage.getUser(req.user.id);

      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!['active', 'pending', 'suspended'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'active', 'pending', or 'suspended'" });
      }

      const updatedUser = await storage.updateUserStatus(userId, status);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Send notification email when approved
      if (status === 'active') {
        try {
          // TODO: Add sendAccountApprovedEmail method to email service
          // await enhancedEmailService.sendAccountApprovedEmail(updatedUser);
          console.log(`User ${updatedUser.email} has been approved`);
        } catch (emailError) {
          console.error("Failed to send approval email:", emailError);
        }
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ message: `User ${status === 'active' ? 'approved' : status} successfully`, user: userWithoutPassword });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Admin endpoint to get pending users
  app.get('/api/admin/users/pending', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingUsers = await storage.getPendingUsers();
      console.log("DEBUG: Pending users query result:", pendingUsers);
      res.json({ users: pendingUsers });
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  // Debug endpoint to check all users in database
  app.get('/api/admin/debug/users', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await db.select().from(users).orderBy(users.createdAt);
      const sanitizedUsers = allUsers.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      console.log("DEBUG: All users in database:", sanitizedUsers);
      res.json({ users: sanitizedUsers, count: sanitizedUsers.length });
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

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

  // Create demo contracts endpoint for testing
  app.post('/api/demo-contracts', async (req, res) => {
    try {
      // Just create a simple demo contract directly in the database
      const [demoContract] = await db.insert(contracts).values({
        bookingId: "demo-booking-id",
        bookingTalentId: "demo-booking-talent-id", 
        title: "Fashion Photography Contract",
        content: `
TALENT ENGAGEMENT AGREEMENT

Agreement Number: DEMO-001
Date: ${new Date().toLocaleDateString()}

PARTIES:
Client: Demo Client
Email: client@demo.com

Talent: Test Talent  
Email: talent@demo.com

PROJECT DETAILS:
Title: Fashion Photography Session
Location: Manhattan Studio
Start Date: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
End Date: ${new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Rate: $500

SCOPE OF WORK:
High-quality fashion photography for spring collection.

TERMS AND CONDITIONS:

1. ENGAGEMENT: Talent agrees to provide professional services as outlined above.

2. COMPENSATION: Payment shall be made according to the agreed rate and schedule.

3. PROFESSIONAL CONDUCT: Talent shall maintain professional standards and arrive punctually to all scheduled activities.

4. CANCELLATION: Either party may cancel with 24-hour notice, subject to applicable cancellation fees.

By signing below, both parties agree to the terms and conditions outlined in this agreement.

Talent Signature: _________________________ Date: _____________

Client Signature: _________________________ Date: _____________
        `,
        status: 'sent',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: "demo-admin-id"
      }).returning();

      res.json({ 
        message: "Demo contract created successfully",
        contract: demoContract
      });
    } catch (error) {
      console.error("Error creating demo contract:", error);
      res.status(500).json({ message: "Failed to create demo contract", error: (error as Error).message });
    }
  });

  // Auth routes are now handled in auth.ts

  // Update user profile
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email, phone } = req.body;

      const updates = { firstName, lastName, email, phone };
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the user data
      const updatedUser = { ...user, ...updates };
      await storage.upsertUser(updatedUser);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Role switching for testing purposes
  // Get current authenticated user (both endpoints for compatibility)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Legacy endpoint for frontend compatibility
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  app.post('/api/auth/switch-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  // Admin endpoint to create login activity table
  app.post('/api/admin/create-login-activity-table', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Create login_activity table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS login_activity (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          user_role user_role NOT NULL,
          login_at TIMESTAMP NOT NULL DEFAULT NOW(),
          ip_address VARCHAR,
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      res.json({ message: "Login activity table created successfully" });
    } catch (error) {
      console.error("Error creating login activity table:", error);
      res.status(500).json({ message: "Failed to create login activity table" });
    }
  });

  // Admin login activity endpoint
  app.get('/api/admin/login-activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { limit = "10" } = req.query;
      const loginActivity = await storage.getRecentLoginActivity(parseInt(limit as string));

      res.json({ loginActivity });
    } catch (error) {
      console.error("Error fetching login activity:", error);
      res.status(500).json({ message: "Failed to fetch login activity" });
    }
  });

  // Admin dashboard stats endpoint
  app.get('/api/admin/dashboard-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get stats for admin dashboard
      const [totalTalents, totalBookings, totalContracts, totalTasks] = await Promise.all([
        // Count only approved talents with profiles
        db.select({ count: sql<number>`count(*)` })
          .from(talentProfiles)
          .innerJoin(users, eq(talentProfiles.userId, users.id))
          .where(and(
            eq(users.role, 'talent'),
            eq(talentProfiles.approvalStatus, 'approved')
          )),
        db.select({ count: sql<number>`count(*)` }).from(bookings),
        db.select({ count: sql<number>`count(*)` }).from(contracts),
        db.select({ count: sql<number>`count(*)` }).from(tasks)
      ]);

      const stats = {
        totalTalents: totalTalents[0]?.count || 0,
        totalBookings: totalBookings[0]?.count || 0,
        totalContracts: totalContracts[0]?.count || 0,
        totalTasks: totalTasks[0]?.count || 0,
        activeBookings: 0, // Will be calculated
        pendingApprovals: 0 // Will be calculated
      };

      // Get active bookings count
      const activeBookingsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(sql`status IN ('signed', 'invoiced', 'paid')`);
      stats.activeBookings = activeBookingsResult[0]?.count || 0;

      // Get pending talent approvals
      const pendingApprovalsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(talentProfiles)
        .where(eq(talentProfiles.approvalStatus, 'pending'));
      stats.pendingApprovals = pendingApprovalsResult[0]?.count || 0;

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin endpoint to create new users
  app.post('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { firstName, lastName, email, role = "talent", status = "active" } = req.body;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "firstName, lastName, and email are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Generate a temporary password (user should change it)
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hashPassword(tempPassword);
      
      // For admin-created users, we want to respect the status parameter
      // This allows admins to create pre-approved users if needed
      const newUser = await db.insert(users).values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role as any,
        status: status as any, // Use the status from request (defaults to "active")
      }).returning();
      
      const createdUser = newUser[0];

      // Remove password from response
      const { password: _, ...userWithoutPassword } = createdUser;
      
      // 📧 Send welcome email with login credentials for admin-created users
      if (role === "talent") {
        try {
          await emailService.sendAdminCreatedTalentWelcome({...userWithoutPassword, password: tempPassword} as any, tempPassword);
        } catch (emailError) {
          console.error("Failed to send welcome email to admin-created talent:", emailError);
          // Don't fail the request if email fails
        }
      }
      
      res.status(201).json({
        ...userWithoutPassword,
        tempPassword // Include temp password in response for admin to share
      });
    } catch (error) {
      console.error("Error creating user (admin):", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user information
  app.patch('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);

      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const targetUserId = req.params.id;
      const updates = req.body;

      // Update user in database
      const updatedUser = await storage.updateUser(targetUserId, updates);

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // User role management (placeholder - not implemented in storage yet)
  app.patch('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  // Object storage routes now handled by Google Cloud Storage in /api/files

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
      const userId = req.user.id;
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

  // Public talent profile viewing (no auth required)
  app.get('/api/talents/public/:id', async (req, res) => {
    try {
      const id = req.params.id;
      console.log("Public talent profile request for:", id);
      let user = null;
      let profile = null;

      // Try to get talent profile by talent profile ID first
      try {
        const allTalents = await storage.getAllTalents({ limit: 1000 });
        const talent = allTalents.talents.find(t => t.id === id);
        if (talent) {
          profile = talent;
          user = talent.user;
        }
      } catch (err) {
        console.log("Error searching by talent profile ID:", err);
      }

      // If not found by talent profile ID, try by user ID
      if (!user) {
        try {
          user = await storage.getUser(id);
          if (user && user.role === 'talent') {
            profile = await storage.getTalentProfile(id);
          }
        } catch (error) {
          console.log("No talent profile found for user:", error);
        }
      }

      if (!user || user.role !== 'talent' || !profile || profile.approvalStatus !== 'approved') {
        return res.status(404).json({ message: "Talent profile not found or not approved" });
      }

      // Return profile data for public viewing (without sensitive user info)
      const { password, ...safeUser } = user;
      res.json({ ...profile, user: safeUser });
    } catch (error) {
      console.error("Error fetching public talent profile:", error);
      res.status(500).json({ message: "Failed to fetch talent profile" });
    }
  });

  // Authenticated talent profile access (for own profile editing)
  app.get('/api/talents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      const requestingUserId = req.user?.id;
      console.log("Fetching talent profile:", { id, requestingUserId });
      let user = null;
      let profile = null;

      // First try to get talent profile by talent profile ID
      try {
        const allTalents = await storage.getAllTalents({ limit: 1000 });
        const talent = allTalents.talents.find(t => t.id === id);
        console.log("Search by talent profile ID:", { found: !!talent, totalTalents: allTalents.talents.length });
        if (talent) {
          profile = talent;
          user = talent.user;
        }
      } catch (err) {
        console.log("Error searching by talent profile ID:", err);
      }

      if (!user) {
        // If not found by talent profile ID, try by user ID
        console.log("Trying to find by user ID:", id);
        user = await storage.getUser(id);
        console.log("Found user:", { user: !!user, role: user?.role });
        if (user && user.role === 'talent') {
          try {
            profile = await storage.getTalentProfile(id);
            console.log("Found talent profile:", !!profile);
          } catch (error) {
            console.log("No talent profile found for user:", error);
          }
        }
      }

      if (!user || user.role !== 'talent') {
        return res.status(404).json({ message: "Talent not found" });
      }

      // If requesting their own profile, always allow access (even if profile doesn't exist)
      if (requestingUserId && requestingUserId === id) {
        return res.json({ 
          ...user,
          talentProfile: profile || null // Allow null profile for own access
        });
      }

      // For public viewing, only show approved profiles
      if (!profile || profile.approvalStatus !== 'approved') {
        return res.status(404).json({ message: "Talent profile not found or not approved" });
      }

      // Return profile data for public viewing
      res.json({ ...profile, user });
    } catch (error) {
      console.error("Error fetching talent:", error);
      res.status(500).json({ message: "Failed to fetch talent" });
    }
  });

  // Public talent profile endpoint (for talent directory)
  app.get('/api/talents/public/:id', async (req: any, res) => {
    try {
      const id = req.params.id;
      let user = null;
      let profile = null;

      // Try to get talent profile by talent profile ID
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

      // For public viewing, only show approved profiles
      if (!profile || profile.approvalStatus !== 'approved') {
        return res.status(404).json({ message: "Talent profile not found or not approved" });
      }

      res.json({ ...profile, user });
    } catch (error) {
      console.error("Error fetching public talent:", error);
      res.status(500).json({ message: "Failed to fetch talent" });
    }
  });

  // Create talent profile
  app.post('/api/talents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'talent') {
        return res.status(403).json({ message: "Talent access required" });
      }

      // Check if profile already exists
      try {
        const existingProfile = await storage.getTalentProfile(userId);
        if (existingProfile) {
          return res.status(400).json({ message: "Talent profile already exists" });
        }
      } catch (error) {
        // Profile doesn't exist, which is what we want
      }

      // Create the profile
      const profileData = {
        userId,
        ...req.body,
        // Auto-approve Bobby for testing, others need approval
        approvalStatus: user.email === 'bobby@5t.com' ? 'approved' : 'pending'
      };

      const profile = await storage.createTalentProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating talent profile:", error);
      res.status(500).json({ message: "Failed to create talent profile" });
    }
  });

  // Update talent profile
  app.patch('/api/talents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const profileId = req.params.id;
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'talent') {
        return res.status(403).json({ message: "Talent access required" });
      }

      // Only allow updating own profile (by user ID)
      if (profileId !== userId) {
        return res.status(403).json({ message: "Can only update own profile" });
      }

      const updatedProfile = await storage.updateTalentProfile(userId, req.body);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating talent profile:", error);
      res.status(500).json({ message: "Failed to update talent profile" });
    }
  });

  // Admin endpoint to create talent profiles for new users
  app.post('/api/talents/admin-create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId: targetUserId, ...profileData } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ message: "userId is required" });
      }

      // Check if profile already exists for target user
      const existingProfile = await storage.getTalentProfile(targetUserId);
      if (existingProfile) {
        return res.status(400).json({ message: "Talent profile already exists for this user" });
      }

      const parsedProfileData = insertTalentProfileSchema.parse({
        ...profileData,
        userId: targetUserId,
        approvalStatus: 'approved' // Admin-created profiles are auto-approved
      });

      const profile = await storage.createTalentProfile(parsedProfileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating talent profile (admin):", error);
      res.status(500).json({ message: "Failed to create talent profile" });
    }
  });

  app.patch('/api/talents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

      // Media URL handling now done via Google Cloud Storage

      const profile = await storage.updateTalentProfile(targetUserId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating talent profile:", error);
      res.status(500).json({ message: "Failed to update talent profile" });
    }
  });

  app.patch('/api/admin/talents/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const profile = await storage.approveTalent(req.params.id, status);
      
      // 📧 Send email notification to talent about approval status
      try {
        const talentUser = await storage.getUser(req.params.id);
        if (talentUser) {
          await emailService.notifyTalentApprovalStatus(talentUser, status);
        }
      } catch (emailError) {
        console.error("Failed to send talent approval notification email:", emailError);
        // Don't fail the request if email fails
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error approving talent:", error);
      res.status(500).json({ message: "Failed to approve talent" });
    }
  });

  // Admin settings endpoint
  app.post('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Validate settings data
      const settingsSchema = z.object({
        siteName: z.string().min(1, "Site name is required"),
        siteDescription: z.string().min(1, "Site description is required"),
        emailNotifications: z.boolean(),
        autoApproveBookings: z.boolean(),
        requireClientApproval: z.boolean(),
        maxBookingDays: z.number().min(1).max(1000),
        cancellationPolicy: z.string().min(1, "Cancellation policy is required"),
        paymentTerms: z.string().min(1, "Payment terms are required"),
      });

      const validatedSettings = settingsSchema.parse(req.body);
      
      // Save to database
      const savedSettings = await storage.upsertSettings(null, 'platform', validatedSettings);

      res.json({ 
        message: "Settings updated successfully",
        settings: savedSettings.settings 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating admin settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Get admin settings endpoint
  app.get('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get settings from database
      const savedSettings = await storage.getSettings(undefined, 'platform');
      
      // Default settings if none exist
      const defaultSettings = {
        siteName: "5T Talent Platform",
        siteDescription: "Professional talent booking platform",
        emailNotifications: true,
        autoApproveBookings: false,
        requireClientApproval: true,
        maxBookingDays: 365,
        cancellationPolicy: "Bookings can be cancelled up to 24 hours before the event.",
        paymentTerms: "Payment due within 30 days of booking confirmation.",
      };

      res.json(savedSettings?.settings || defaultSettings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Booking routes
  // Public booking endpoint (no auth required) - creates booking record and sends email to admin
  app.post('/api/bookings/public', async (req, res) => {
    try {
      const { 
        title, 
        category, 
        startDate, 
        endDate, 
        location, 
        description, 
        clientName, 
        clientEmail, 
        clientPhone,
        talentId,
        talentName,
        budget
      } = req.body;

      // Validate required fields
      if (!title || !clientName || !clientEmail) {
        return res.status(400).json({ 
          message: "Title, client name, and email are required" 
        });
      }

      // Create booking record in database for admin dashboard
      const bookingData = {
        title,
        category: category || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        location: location || null,
        description: description || null,
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        status: 'inquiry' as const,
        // Store talent info if provided
        requestedTalentId: talentId || null,
        requestedTalentName: talentName || null,
        budget: budget ? parseFloat(budget) : null,
        // No clientId since this is a public submission
        clientId: "public",
        createdBy: "public",
      };

      const booking = await storage.createBooking(bookingData);

      // Send email notification to admin
      try {
        await enhancedEmailService.sendBookingRequestNotification({
          bookingDetails: {
            title,
            category,
            startDate,
            endDate,
            location,
            description,
            clientName,
            clientEmail,
            clientPhone,
            bookingId: booking.id // Include booking ID for admin reference
          }
        });
      } catch (emailError) {
        console.error("Failed to send booking notification email:", emailError);
        // Don't fail the request if email fails
      }

      // Create in-app notifications for all admin users
      try {
        const adminUsers = await storage.getAdminUsers();
        if (adminUsers && adminUsers.length > 0) {
          const notificationData = adminUsers.map(admin => ({
            userId: admin.id,
            type: 'booking_request' as const,
            title: '🎬 New Booking Request',
            message: `${clientName} submitted a booking request for "${title}"`,
            data: {
              bookingId: booking.id,
              clientName,
              clientEmail,
              projectTitle: title,
            },
            actionUrl: `/admin/booking-requests`,
            read: false,
          }));
          await NotificationService.createNotifications(notificationData);
        }
      } catch (notificationError) {
        console.error("Failed to create in-app notifications:", notificationError);
        // Don't fail the request if notification creation fails
      }

      res.json({ 
        message: "Booking request submitted successfully! We'll get back to you within 24 hours.",
        success: true,
        bookingId: booking.id
      });
    } catch (error) {
      console.error("Error processing public booking request:", error);
      res.status(500).json({ message: "Failed to submit booking request" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      let bookingData;
      
      // Convert date strings to Date objects for validation
      const processedBody = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      
      // Extract talent info for admin review (NEW WORKFLOW)
      const { talentId, talentName, talents, ...bookingInfo } = processedBody;
      
      // Store requested talent information for admin review
      if (talentId && talentName) {
        bookingData = {
          ...bookingInfo,
          requestedTalentId: talentId,
          requestedTalentName: talentName,
          status: 'inquiry' // This will be reviewed by admin
        };
      } else if (processedBody.talents && Array.isArray(processedBody.talents)) {
        // Handle multiple talents (legacy)
        const { talents, ...bookingInfo } = processedBody;
        bookingData = insertBookingSchema.parse(bookingInfo);
      } else {
        bookingData = insertBookingSchema.parse(processedBody);
      }

      bookingData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(bookingData);
      
      // NOTE: We NO LONGER automatically create booking_talents records
      // Admin will handle talent outreach manually
      
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Booking validation error:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const oldBooking = await storage.getBooking(req.params.id);
      const booking = await storage.updateBooking(req.params.id, req.body);
      
      // 📧 Send email notification if booking status changed to confirmed
      try {
        if (req.body.status === 'signed' && oldBooking?.status !== 'signed') {
          const updatedBooking = await storage.getBooking(req.params.id);
          if (updatedBooking) {
            // Collect all recipients (client + talents)
            const recipients = [updatedBooking.client];
            updatedBooking.bookingTalents.forEach(bt => recipients.push(bt.talent));
            
            await enhancedEmailService.notifyBookingConfirmed(recipients, updatedBooking);
          }
        }
      } catch (emailError) {
        console.error("Failed to send booking confirmation notification email:", emailError);
        // Don't fail the request if email fails
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // NEW: Admin endpoint to see bookings with requested talents 
  app.get('/api/admin/booking-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get bookings that have a requested talent but no actual talent assignments yet
      const pendingBookings = await db
        .select({
          booking: bookings,
          client: users,
          requestedTalent: {
            id: sql<string>`requested_talent.id`,
            firstName: sql<string>`requested_talent.first_name`,
            lastName: sql<string>`requested_talent.last_name`,
            email: sql<string>`requested_talent.email`,
          }
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.clientId, users.id))
        .leftJoin(sql`${users} as requested_talent`, eq(bookings.requestedTalentId, sql`requested_talent.id`))
        .where(
          and(
            sql`${bookings.requestedTalentId} IS NOT NULL`,
            eq(bookings.status, 'inquiry')
          )
        )
        .orderBy(desc(bookings.createdAt));

      res.json({ 
        bookingRequests: pendingBookings.map(row => ({
          ...row.booking,
          client: row.client,
          requestedTalent: row.requestedTalent
        }))
      });
    } catch (error) {
      console.error("Error fetching admin booking requests:", error);
      res.status(500).json({ message: "Failed to fetch booking requests" });
    }
  });

  // NEW: Admin endpoint to send booking request to specific talent
  app.post('/api/admin/send-talent-request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { bookingId, talentId, message } = req.body;

      if (!bookingId || !talentId) {
        return res.status(400).json({ message: "Booking ID and talent ID are required" });
      }

      // Add talent to booking (this creates the actual request)
      await storage.addTalentToBooking(bookingId, talentId);

      res.json({ message: "Talent request sent successfully" });
    } catch (error) {
      console.error("Error sending talent request:", error);
      res.status(500).json({ message: "Failed to send talent request" });
    }
  });

  // Send booking requests to talents
  app.post('/api/bookings/:id/send-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { talentIds } = req.body;
      if (!talentIds || !Array.isArray(talentIds) || talentIds.length === 0) {
        return res.status(400).json({ message: "Talent IDs are required" });
      }

      const bookingId = req.params.id;
      
      // Get booking details for email notifications
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Add each talent to the booking
      const bookingTalents = [];
      for (const talentId of talentIds) {
        const bookingTalent = await storage.addTalentToBooking(bookingId, talentId);
        bookingTalents.push(bookingTalent);
        
        // 📧 Send email notification to talent about new booking request
        try {
          const talent = await storage.getUser(talentId);
          if (talent) {
            await emailService.notifyTalentBookingRequest(talent, booking, booking.client);
          }
        } catch (emailError) {
          console.error(`Failed to send booking request notification to talent ${talentId}:`, emailError);
          // Don't fail the request if email fails
        }

        // 🔔 Create in-app notification for talent
        try {
          await NotificationService.notifyTalentBookingRequest(talentId, {
            bookingTitle: booking.title,
            clientName: `${booking.client.firstName} ${booking.client.lastName}`,
            bookingId: booking.id
          });
        } catch (notificationError) {
          console.error(`Failed to send in-app notification to talent ${talentId}:`, notificationError);
          // Don't fail the request if notification fails
        }
      }

      res.json({ 
        message: `Booking requests sent to ${talentIds.length} talent${talentIds.length > 1 ? 's' : ''}`,
        bookingTalents 
      });
    } catch (error) {
      console.error("Error sending booking requests:", error);
      res.status(500).json({ message: "Failed to send booking requests" });
    }
  });

  // Get booking requests for talent, admin, or client
  app.get('/api/booking-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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

      // If talent accepted, send notification to admin about contract creation
      if (action === 'accept') {
        try {
          // Get booking details for the notification
          const bookingTalent = await db
            .select({
              bookingTalent: bookingTalents,
              booking: bookings,
              talent: users,
              client: {
                id: sql<string>`client_user.id`,
                firstName: sql<string>`client_user.first_name`,
                lastName: sql<string>`client_user.last_name`,
                email: sql<string>`client_user.email`,
              }
            })
            .from(bookingTalents)
            .innerJoin(bookings, eq(bookingTalents.bookingId, bookings.id))
            .innerJoin(users, eq(bookingTalents.talentId, users.id))
            .innerJoin(sql`users as client_user`, eq(bookings.clientId, sql`client_user.id`))
            .where(eq(bookingTalents.id, req.params.requestId))
            .limit(1);

          if (bookingTalent.length > 0) {
            const data = bookingTalent[0];
            
            // Send email notification to admin about contract creation needed
            await enhancedEmailService.notifyAdminContractNeeded({
              booking: data.booking,
              talent: data.talent,
              client: data.client,
              bookingTalentId: data.bookingTalent.id
            });

            // Create in-app notification for admin
            const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
            for (const admin of adminUsers) {
              await NotificationService.notifyAdminBookingAccepted(admin.id, {
                talentName: `${data.talent.firstName} ${data.talent.lastName}`,
                bookingTitle: data.booking.title,
                bookingId: data.booking.id,
                bookingTalentId: data.bookingTalent.id
              });
            }
          }
        } catch (emailError) {
          console.error("Failed to send admin contract notification:", emailError);
          // Don't fail the request if email fails
        }
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error responding to booking request:", error);
      res.status(500).json({ message: "Failed to respond to booking request" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdBy: userId // Automatically set the createdBy field to the authenticated user
      });
      const task = await storage.createTask(taskData);
      
      // 📧 Send email notification to assigned talent about new task
      try {
        if (task.assigneeId) {
          const assignedTalent = await storage.getUser(task.assigneeId);
          if (assignedTalent) {
            await emailService.notifyTalentTaskAssigned(assignedTalent, task, user);
          }
        }
      } catch (emailError) {
        console.error("Failed to send task assignment notification email:", emailError);
        // Don't fail the request if email fails
      }
      
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
      const userId = req.user.id;
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

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteTask(req.params.id);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Announcement endpoints
  app.get('/api/announcements', async (req, res) => {
    try {
      const { 
        category, 
        search, 
        published = "true",
        page = "1", 
        limit = "20" 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const result = await storage.getAllAnnouncements({
        category: category as string,
        search: search as string,
        published: published === "true",
        limit: parseInt(limit as string),
        offset,
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.get('/api/announcements/:id', async (req, res) => {
    try {
      const announcement = await storage.getAnnouncement(req.params.id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      console.error("Error fetching announcement:", error);
      res.status(500).json({ message: "Failed to fetch announcement" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Convert date strings to Date objects for validation
      const processedBody = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
        createdBy: userId,
      };

      const announcementData = insertAnnouncementSchema.parse(processedBody);
      const announcement = await storage.createAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.patch('/api/announcements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Convert date strings to Date objects if provided
      const processedBody = { ...req.body };
      if (processedBody.date) {
        processedBody.date = new Date(processedBody.date);
      }
      if (processedBody.deadline) {
        processedBody.deadline = new Date(processedBody.deadline);
      }

      const announcement = await storage.updateAnnouncement(req.params.id, processedBody);
      res.json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/announcements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteAnnouncement(req.params.id);
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Notifications endpoint - Updated to use NotificationService
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const { signatureData } = req.body;
      
      if (!signatureData) {
        return res.status(400).json({ message: "Signature data is required" });
      }

      // Get contract details before signing for notifications
      const contractDetails = await db.query.contracts.findFirst({
        where: eq(contracts.id, contractId),
        with: {
          booking: true,
          bookingTalent: {
            with: {
              talent: true,
            },
          },
        },
      });

      if (!contractDetails) {
        return res.status(404).json({ message: "Contract not found" });
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

      // 🔔 Notify admin that contract has been signed
      try {
        const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
        for (const admin of adminUsers) {
          await NotificationService.notifyAdminContractSigned(admin.id, {
            talentName: `${contractDetails.bookingTalent.talent.firstName} ${contractDetails.bookingTalent.talent.lastName}`,
            bookingTitle: contractDetails.booking.title,
            contractId: contractId
          });
        }
      } catch (notificationError) {
        console.error("Failed to send contract signed notification:", notificationError);
        // Don't fail the request if notification fails
      }
      
      res.json({ message: "Contract signed successfully" });
    } catch (error) {
      console.error("Error signing contract:", error);
      res.status(500).json({ message: "Failed to sign contract" });
    }
  });

  // Test endpoint to seed Bobby Craig account
  app.post('/api/seed-bobby-account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Check if Bobby already exists
      const existingBobby = await storage.getUserByEmail("bobby@5t.com");
      if (existingBobby) {
        return res.json({ 
          message: "Bobby Craig already exists",
          login: { email: "bobby@5t.com", password: "bobby123" }
        });
      }

      // Import hash function
      const { hashPassword } = await import("./auth");

      // Create Bobby Craig user
      const bobbyUser = await storage.createUser({
        email: "bobby@5t.com",
        password: await hashPassword("bobby123"),
        firstName: "Bobby",
        lastName: "Craig",
        role: "talent",
      });

      // Create Bobby's talent profile
      await storage.createTalentProfile({
        userId: bobbyUser.id,
        stageName: "Bobby Craig",
        categories: ["Commercial", "On-Camera", "Corporate"],
        skills: ["Acting", "Voice Acting", "Presenting", "Comedy"],
        bio: "Versatile talent with experience in commercial acting, corporate presentations, and voice work. Professional, reliable, and great with client direction.",
        location: "New York, NY",
        unionStatus: "SAG-AFTRA" as const,
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

      res.json({ 
        message: "Bobby Craig account created successfully!",
        user: {
          id: bobbyUser.id,
          email: bobbyUser.email,
          firstName: bobbyUser.firstName,
          lastName: bobbyUser.lastName,
          role: bobbyUser.role
        },
        login: {
          email: "bobby@5t.com",
          password: "bobby123"
        }
      });
    } catch (error) {
      console.error("Error creating Bobby's account:", error);
      res.status(500).json({ message: "Failed to create Bobby's account" });
    }
  });

  // Test endpoint to create booking request for Bobby
  app.post('/api/create-test-booking-for-bobby', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get Bobby's user account
      const bobbyUser = await storage.getUserByEmail("bobby@5t.com");
      if (!bobbyUser) {
        return res.status(404).json({ message: "Bobby Craig account not found. Please seed demo data first." });
      }

      // Create a test booking
      const booking = await storage.createBooking({
        title: "Fashion Commercial Shoot - Fall Campaign",
        notes: "High-end fashion commercial for luxury brand fall campaign. Looking for versatile talent with commercial acting experience.",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Same day
        location: "NYC Studio - Manhattan",
        clientId: user.id, // Admin creating as client
        createdBy: user.id,
        status: "inquiry"
      });

      // Send booking request to Bobby
      const bookingTalent = await storage.addTalentToBooking(booking.id, bobbyUser.id);
      
      // Send email notification to Bobby
      try {
        const bookingWithClient = await storage.getBooking(booking.id);
        if (bookingWithClient) {
          await emailService.notifyTalentBookingRequest(bobbyUser, bookingWithClient, bookingWithClient.client);
        }
      } catch (emailError) {
        console.error("Failed to send booking request email:", emailError);
      }

      // Create in-app notification for Bobby
      try {
        await NotificationService.notifyTalentBookingRequest(bobbyUser.id, {
          bookingTitle: booking.title,
          clientName: `${user.firstName} ${user.lastName}`,
          bookingId: booking.id
        });
      } catch (notificationError) {
        console.error("Failed to send in-app notification:", notificationError);
      }

      res.json({ 
        message: "Test booking request created and sent to Bobby Craig",
        booking,
        bookingTalent,
        bobbyLogin: {
          email: "bobby@5t.com",
          password: "bobby123"
        }
      });
    } catch (error) {
      console.error("Error creating test booking:", error);
      res.status(500).json({ message: "Failed to create test booking" });
    }
  });

  // Quick fix endpoint to update booking status
  app.post('/api/fix-booking-status/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const booking = await storage.updateBooking(req.params.id, { status: "signed" });
      return res.json({ message: "Booking status updated to signed", booking });
    } catch (error) {
      console.error("Error updating booking status:", error);
      return res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Debug endpoint for contracts page
  app.get('/api/debug/bookings-for-contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { bookings } = await storage.getAllBookings();
      
      // Filter bookings that have accepted talents (ready for contracts)
      const contractReadyBookings = bookings.filter(booking => 
        booking.bookingTalents && booking.bookingTalents.some(bt => bt.requestStatus === 'accepted')
      );

      return res.json({ 
        allBookings: bookings.length,
        contractReadyBookings: contractReadyBookings.length,
        bookings: contractReadyBookings.map(b => ({
          id: b.id,
          title: b.title,
          code: b.code,
          status: b.status,
          acceptedTalents: b.bookingTalents.filter(bt => bt.requestStatus === 'accepted').length
        }))
      });
    } catch (error) {
      console.error("Error debugging bookings:", error);
      return res.status(500).json({ message: "Failed to debug bookings" });
    }
  });

  // Test endpoint to create sample contract
  app.post('/api/create-test-contract', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Create a simple test contract
      const [contract] = await db.insert(contracts).values({
        bookingId: "a8b25d8e-8df4-40de-81a6-eba37b898d19",
        bookingTalentId: "153105e0-84a8-4b81-87d3-246a14d9cefc",
        title: "Fashion Editorial Contract - Test Signature",
        content: `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px;">

<!-- Header -->
<div style="text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px;">
  <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0;">PROFESSIONAL MODELING AGREEMENT</h1>
  <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">5T Elite Talent, Inc.</p>
  <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">122 W 26th St, Suite 902, New York, NY 10001</p>
</div>

<!-- Agreement Details -->
<div style="margin-bottom: 25px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="font-weight: bold; padding: 5px 0;">Agreement Number:</td>
      <td>BK-2025-0001</td>
      <td style="font-weight: bold; padding: 5px 0;">Date:</td>
      <td>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
    </tr>
  </table>
</div>

<!-- Parties Section -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PARTIES TO AGREEMENT</h2>
  
  <div style="display: flex; gap: 40px; margin-top: 15px;">
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">CLIENT:</h3>
      <p style="margin: 0; line-height: 1.4;">
        <strong>Admin User</strong><br>
        Email: admin.test@gmail.com<br>
      </p>
    </div>
    
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">TALENT:</h3>
      <p style="margin: 0; line-height: 1.4;">
        <strong>Test Talent</strong><br>
        Stage Name: Test Star<br>
        Email: test.talent@example.com<br>
      </p>
    </div>
  </div>
</div>

<!-- Project Details -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PROJECT SPECIFICATIONS</h2>
  
  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
    <tr style="background-color: #f8f9fa;">
      <td style="padding: 12px; border: 1px solid #e9ecef; font-weight: bold; width: 30%;">Project Title:</td>
      <td style="padding: 12px; border: 1px solid #e9ecef;">Fashion Editorial Shoot - Contract Test</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #e9ecef; font-weight: bold;">Shoot Location:</td>
      <td style="padding: 12px; border: 1px solid #e9ecef;">SoHo Photography Studio, NYC</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
      <td style="padding: 12px; border: 1px solid #e9ecef; font-weight: bold;">Shoot Date:</td>
      <td style="padding: 12px; border: 1px solid #e9ecef;">October 25, 2025</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #e9ecef; font-weight: bold;">Session Fee:</td>
      <td style="padding: 12px; border: 1px solid #e9ecef;">$3,000.00</td>
    </tr>
  </table>
</div>

<!-- Terms -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">TERMS AND CONDITIONS</h2>
  
  <div style="margin-top: 15px;">
    <h3 style="font-size: 14px; font-weight: bold; color: #333; margin: 20px 0 10px 0;">1. ENGAGEMENT</h3>
    <p style="margin: 0 0 15px 0; text-align: justify;">
      Talent agrees to provide professional modeling services for the specified fashion editorial shoot, maintaining the highest standards of professionalism and punctuality.
    </p>
    
    <h3 style="font-size: 14px; font-weight: bold; color: #333; margin: 20px 0 10px 0;">2. COMPENSATION</h3>
    <p style="margin: 0 0 15px 0; text-align: justify;">
      Payment of $3,000.00 shall be made within 30 days of completion of services. This covers the full session fee for the editorial shoot.
    </p>
    
    <h3 style="font-size: 14px; font-weight: bold; color: #333; margin: 20px 0 10px 0;">3. USAGE RIGHTS</h3>
    <p style="margin: 0 0 15px 0; text-align: justify;">
      Images may be used for editorial purposes in print and digital formats. Commercial usage requires separate licensing agreement.
    </p>
    
    <h3 style="font-size: 14px; font-weight: bold; color: #333; margin: 20px 0 10px 0;">4. PROFESSIONAL CONDUCT</h3>
    <p style="margin: 0 0 15px 0; text-align: justify;">
      Talent shall arrive punctually, prepared, and maintain professional behavior throughout the engagement.
    </p>
    
    <h3 style="font-size: 14px; font-weight: bold; color: #333; margin: 20px 0 10px 0;">5. CANCELLATION POLICY</h3>
    <p style="margin: 0 0 15px 0; text-align: justify;">
      Either party may cancel with 48-hour notice. Cancellations within 24 hours may be subject to a 50% cancellation fee.
    </p>
  </div>
</div>

<!-- Signature Section -->
<div style="margin-top: 40px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">SIGNATURES</h2>
  
  <div style="display: flex; gap: 60px; margin-top: 30px;">
    <div style="flex: 1;">
      <p style="margin: 0 0 40px 0; font-weight: bold;">TALENT SIGNATURE:</p>
      <div style="border-bottom: 2px solid #333; height: 60px; margin-bottom: 10px;"></div>
      <p style="margin: 0; font-size: 12px; color: #666;">
        Test Talent<br>
        Date: _______________
      </p>
    </div>
    
    <div style="flex: 1;">
      <p style="margin: 0 0 40px 0; font-weight: bold;">CLIENT SIGNATURE:</p>
      <div style="border-bottom: 2px solid #333; height: 60px; margin-bottom: 10px;"></div>
      <p style="margin: 0; font-size: 12px; color: #666;">
        Admin User<br>
        Date: _______________
      </p>
    </div>
  </div>
</div>

<!-- Footer -->
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center;">
  <p style="font-size: 11px; color: #666; margin: 0;">
    This agreement constitutes the entire understanding between the parties and supersedes all prior negotiations, representations, or agreements relating to this subject matter.
  </p>
  <p style="font-size: 11px; color: #666; margin: 10px 0 0 0;">
    <strong>5T Elite Talent, Inc.</strong> | 122 W 26th St, Suite 902, New York, NY 10001
  </p>
</div>

</div>
        `,
        pdfUrl: `/contracts/test-contract-${Date.now()}.pdf`,
        status: 'sent',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdBy: userId,
      }).returning();

      // Create signature record for the talent
      await db.insert(signatures).values({
        contractId: contract.id,
        signerId: "1bfb8178-15cb-44b8-8ec9-9b29f2657793",
        status: 'pending',
      });

      res.json({ message: "Test contract created successfully", contract });
    } catch (error) {
      console.error("Error creating test contract:", error);
      res.status(500).json({ message: "Failed to create test contract" });
    }
  });

  app.post('/api/bookings/:bookingId/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user.id;
      const { bookingTalentId } = req.body;
      
      console.log('Contract creation debug:', { bookingId, userId, bookingTalentId });
      
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
      
      console.log('Booking query result:', { booking, hasBookingTalents: !!booking?.bookingTalents[0] });
      
      if (!booking || !booking.bookingTalents[0]) {
        console.log('Booking or talent not found:', { booking: !!booking, bookingTalents: booking?.bookingTalents });
        return res.status(404).json({ message: "Booking or talent not found" });
      }
      
      const bookingTalent = booking.bookingTalents[0];
      const contractData = {
        booking,
        talent: bookingTalent.talent,
        talentProfile: bookingTalent.talent.talentProfile,
        client: booking.client,
      };
      
      console.log('Creating contract with data:', { contractData: !!contractData });
      
      const contract = await ContractService.createContract(
        bookingId,
        bookingTalentId,
        userId,
        contractData
      );
      
      // 📧 Send email notification to talent and client about new contract
      try {
        await emailService.notifyContractSent(
          bookingTalent.talent, 
          booking, 
          contract.title, 
          'talent'
        );
        await emailService.notifyContractSent(
          booking.client, 
          booking, 
          contract.title, 
          'client'
        );
      } catch (emailError) {
        console.error("Failed to send contract notification emails:", emailError);
        // Don't fail the request if email fails
      }

      // 🔔 Create in-app notification for talent
      try {
        await NotificationService.notifyTalentContractCreated(bookingTalent.talent.id, {
          bookingTitle: booking.title,
          contractId: contract.id
        });
      } catch (notificationError) {
        console.error("Failed to send talent contract notification:", notificationError);
        // Don't fail the request if notification fails
      }

      // 🔔 Create in-app notification for admins
      try {
        const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
        for (const admin of adminUsers) {
          await NotificationService.createNotification({
            userId: admin.id,
            type: 'contract_created',
            title: 'Contract Created',
            message: `Contract for "${booking.title}" has been sent to ${bookingTalent.talent.firstName} ${bookingTalent.talent.lastName} for signature.`,
            read: false,
            actionUrl: '/admin/bookings',
            data: { contractId: contract.id, bookingId: booking.id }
          });
        }
      } catch (notificationError) {
        console.error("Failed to send admin contract notification:", notificationError);
        // Don't fail the request if notification fails
      }
      
      res.json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: "Failed to create contract", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Fix task scope enum endpoint
  app.post('/api/admin/fix-task-scope', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Add 'general' to the task_scope enum
      await db.execute(sql`
        ALTER TYPE task_scope ADD VALUE IF NOT EXISTS 'general';
      `);
      
      res.json({ success: true, message: "Task scope enum updated successfully" });
    } catch (error) {
      console.error("Error updating task scope enum:", error);
      res.status(500).json({ 
        message: "Failed to update task scope enum", 
        error: (error as Error).message 
      });
    }
  });

  // Public endpoint to add task priority field (for setup)
  app.post('/api/setup/add-task-priority', async (req: any, res) => {
    try {

      // Create task_priority enum if it doesn't exist
      await db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Add priority column to tasks table if it doesn't exist
      await db.execute(sql`
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority task_priority DEFAULT 'medium';
      `);

      res.json({ success: true, message: "Task priority field added successfully" });
    } catch (error) {
      console.error("Error adding task priority field:", error);
      res.status(500).json({ 
        message: "Failed to add task priority field", 
        error: (error as Error).message 
      });
    }
  });

  // Public endpoint to create sample tasks (for setup)
  app.post('/api/setup/create-sample-tasks', async (req: any, res) => {
    try {
      // Get the first admin user from the database
      const users = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
      if (users.length === 0) {
        return res.status(400).json({ message: "No admin user found" });
      }
      const userId = users[0].id;

      // Create sample tasks
      const sampleTasks = [
        {
          title: "Platform Verification Task",
          description: "Verify that the new task management system is working properly",
          status: "todo" as const,
          scope: "general" as const,
          priority: "high" as const,
          createdBy: userId,
        },
        {
          title: "Update Talent Profiles",
          description: "Review and update talent profile information for accuracy",
          status: "in_progress" as const,
          scope: "talent" as const,
          priority: "medium" as const,
          createdBy: userId,
        },
        {
          title: "Booking Follow-up",
          description: "Follow up with clients on pending booking requests",
          status: "todo" as const,
          scope: "booking" as const,
          priority: "high" as const,
          createdBy: userId,
        },
        {
          title: "System Maintenance",
          description: "Perform routine system maintenance and updates",
          status: "done" as const,
          scope: "general" as const,
          priority: "low" as const,
          createdBy: userId,
        }
      ];

      const createdTasks = [];
      for (const taskData of sampleTasks) {
        const task = await storage.createTask(taskData);
        createdTasks.push(task);
      }

      res.json({ 
        success: true, 
        message: "Sample tasks created successfully", 
        tasks: createdTasks 
      });
    } catch (error) {
      console.error("Error creating sample tasks:", error);
      res.status(500).json({ 
        message: "Failed to create sample tasks", 
        error: (error as Error).message 
      });
    }
  });

  // Create notifications table endpoint
  app.post('/api/admin/create-notifications-table', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Create the enum type first (simple approach)
      try {
        await db.execute(sql`
          CREATE TYPE notification_type AS ENUM(
            'booking_request', 
            'booking_accepted', 
            'booking_declined', 
            'contract_created', 
            'contract_signed', 
            'task_assigned', 
            'talent_approved', 
            'system_announcement'
          )
        `);
        console.log("Created notification_type enum");
      } catch (enumError) {
        console.log("Enum probably already exists:", (enumError as Error).message);
      }
      
      // Create the table (simple approach)
      try {
        await db.execute(sql`
          CREATE TABLE notifications (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id varchar NOT NULL REFERENCES users(id),
            type notification_type NOT NULL,
            title varchar NOT NULL,
            message text NOT NULL,
            data jsonb,
            read boolean DEFAULT false,
            action_url varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
          )
        `);
        console.log("Created notifications table");
      } catch (tableError) {
        console.log("Table probably already exists:", (tableError as Error).message);
      }
      
      res.json({ success: true, message: "Notifications system setup completed" });
    } catch (error) {
      console.error("Error setting up notifications:", error);
      res.status(500).json({ 
        message: "Failed to setup notifications", 
        error: (error as Error).message 
      });
    }
  });

  // Test notification creation endpoint
  app.post('/api/notifications/test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Create a test notification
      const notification = await NotificationService.createNotification({
        userId: userId,
        type: 'system_announcement',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        read: false,
        actionUrl: '/talent/dashboard'
      });
      
      res.json({ success: true, notification });
    } catch (error) {
      console.error("Error creating test notification:", error);
      res.status(500).json({ 
        message: "Failed to create test notification", 
        error: (error as Error).message 
      });
    }
  });

  // Test profile creation endpoint for Bobby
  app.post('/api/talents/test-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'talent') {
        return res.status(403).json({ message: "Talent access required" });
      }

      // Check if profile already exists
      try {
        const existingProfile = await storage.getTalentProfile(userId);
        if (existingProfile) {
          return res.json({ message: "Profile already exists", profile: existingProfile });
        }
      } catch (error) {
        // Profile doesn't exist, create a basic one
      }

      // Create a basic profile for testing
      const basicProfile = {
        userId,
        stageName: `${user.firstName} ${user.lastName}`,
        bio: "Professional talent ready for new opportunities.",
        categories: ["Commercial", "Fashion"],
        skills: ["Acting", "Modeling"],
        location: "New York, NY",
        unionStatus: "Non-Union" as const,
        measurements: {
          height: "6'0\"",
          hair: "Brown",
          eyes: "Brown"
        },
        rates: {
          hourly: 150,
          day: 800
        },
        approvalStatus: 'approved' as const // Auto-approved for testing
      };

      const profile = await storage.createTalentProfile(basicProfile);
      res.json({ success: true, message: "Test profile created", profile });
    } catch (error) {
      console.error("Error creating test profile:", error);
      res.status(500).json({ message: "Failed to create test profile" });
    }
  });

  // Notification routes
  app.get('/api/notifications-new', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { limit, unreadOnly } = req.query;
      
      const notifications = await NotificationService.getUserNotifications(userId, {
        limit: limit ? parseInt(limit) : 20,
        unreadOnly: unreadOnly === 'true'
      });
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const count = await NotificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;
      
      await NotificationService.markAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await NotificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Admin endpoint to remove Bobby test accounts
  app.delete('/api/admin/remove-bobby-accounts', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      console.log('🔍 Searching for Bobby test accounts...');
      
      // Find Bobby accounts
      const bobbyUsers = await db.select().from(users).where(
        or(
          like(users.email, '%bobby%'),
          like(users.firstName, '%Bobby%'),
          and(
            like(users.firstName, '%Test%'),
            like(users.lastName, '%Bobby%')
          )
        )
      );
      
      if (bobbyUsers.length === 0) {
        return res.json({ 
          message: 'No Bobby test accounts found',
          removedCount: 0,
          accounts: []
        });
      }
      
      console.log(`📋 Found ${bobbyUsers.length} Bobby account(s):`);
      bobbyUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.status}`);
      });
      
      // Delete associated data first (in correct order due to foreign key constraints)
      for (const user of bobbyUsers) {
        console.log(`\n🗑️  Removing data for ${user.firstName} ${user.lastName}...`);
        
        // Delete login activity
        await db.delete(loginActivity).where(eq(loginActivity.userId, user.id));
        console.log('   ✅ Deleted login activity');
        
        // Delete notifications
        await db.delete(notifications).where(eq(notifications.userId, user.id));
        console.log('   ✅ Deleted notifications');
        
        // Note: talentPageViews and documents tables don't exist in current schema
        
        // Delete talent profile (if exists)
        await db.delete(talentProfiles).where(eq(talentProfiles.userId, user.id));
        console.log('   ✅ Deleted talent profile');
        
        // Delete booking talents (if user was assigned to bookings)
        const talentProfileIds = await db.select({ id: talentProfiles.id })
          .from(talentProfiles)
          .where(eq(talentProfiles.userId, user.id));
        
        for (const profile of talentProfileIds) {
          await db.delete(bookingTalents).where(eq(bookingTalents.talentId, profile.id));
        }
        console.log('   ✅ Deleted booking talent assignments');
        
        // Delete bookings created by user
        await db.delete(bookings).where(eq(bookings.createdBy, user.id));
        console.log('   ✅ Deleted created bookings');
        
        // Delete bookings where user was the client
        await db.delete(bookings).where(eq(bookings.clientId, user.id));
        console.log('   ✅ Deleted client bookings');
        
        // Delete tasks assigned to user
        await db.delete(tasks).where(eq(tasks.assigneeId, user.id));
        console.log('   ✅ Deleted assigned tasks');
        
        // Delete contracts created by user
        await db.delete(contracts).where(eq(contracts.createdBy, user.id));
        console.log('   ✅ Deleted created contracts');
        
        // Finally, delete the user
        await db.delete(users).where(eq(users.id, user.id));
        console.log('   ✅ Deleted user account');
      }
      
      console.log('\n🎉 Successfully removed all Bobby test accounts and associated data!');
      
      res.json({
        message: 'Successfully removed Bobby test accounts',
        removedCount: bobbyUsers.length,
        accounts: bobbyUsers.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role
        }))
      });
      
    } catch (error) {
      console.error('❌ Error removing Bobby accounts:', error);
      res.status(500).json({ 
        message: 'Failed to remove Bobby accounts',
        error: (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}