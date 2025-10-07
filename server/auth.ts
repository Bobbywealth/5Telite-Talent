import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { emailService } from "./emailService";
import { enhancedEmailService } from "./emailServiceEnhanced";
import { User as DbUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends Omit<DbUser, "password"> {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session configuration
  const PostgresSessionStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false, // Table already exists, don't try to recreate
      tableName: 'sessions', // Specify the correct table name
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // Use lax for same-origin
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValidPassword = await comparePasswords(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Check if user is approved
          if (user.status === "pending") {
            return done(null, false, { message: "Your account is pending admin approval. Please wait for approval before logging in." });
          }

          if (user.status === "suspended") {
            return done(null, false, { message: "Your account has been suspended. Please contact support." });
          }

          // Remove password from user object
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        done(null, userWithoutPassword);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, role = "talent" } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      });

      console.log("DEBUG: Created user with status:", user.status, "for email:", email);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Check if user needs admin approval
      if (user.status === "pending") {
        // Send confirmation email but don't log in
        try {
          if (role === "talent") {
            await enhancedEmailService.sendTalentWelcomeEmail(userWithoutPassword);
          }
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }

        return res.status(201).json({ 
          message: "Registration successful! Your account is pending admin approval. You'll receive an email once approved.",
          user: userWithoutPassword,
          requiresApproval: true
        });
      }

      // 📧 Send welcome email for approved users
      if (role === "talent") {
        try {
          await enhancedEmailService.sendTalentWelcomeEmail(userWithoutPassword);
        } catch (emailError) {
          console.error("Failed to send welcome email to new talent:", emailError);
          // Don't fail the request if email fails
        }
      }

      // Log user in only if approved
      req.login(userWithoutPassword, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, async (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Record login activity
        try {
          const ipAddress = req.ip || req.connection.remoteAddress;
          const userAgent = req.get('User-Agent');
          await storage.recordLoginActivity(user.id, user.role, ipAddress, userAgent);
        } catch (activityError) {
          console.error("Failed to record login activity:", activityError);
          // Don't fail the login if activity recording fails
        }
        
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      // Destroy the session to ensure complete logout
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.sendStatus(200);
      });
    });
  });

  // Handle direct GET navigation to logout
  app.get("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      // Destroy the session to ensure complete logout
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        // Send HTML with JavaScript redirect to ensure client-side routing works
        res.send(`
          <html>
            <head>
              <meta http-equiv="refresh" content="0; url=/">
              <script>window.location.href = "/";</script>
            </head>
            <body>
              <p>Logging out... If you are not redirected, <a href="/">click here</a>.</p>
            </body>
          </html>
        `);
      });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export { hashPassword, comparePasswords };