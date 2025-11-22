import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ClerkExpressWithAuth, clerkClient } from "@clerk/clerk-sdk-node";
import { insertRfidLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Clerk Middleware for all routes (optional, or specific routes)
  // We'll use ClerkExpressWithAuth() on specific protected routes

  // Auth routes - User Sync
  // When a user hits this, we ensure they are in our local DB
  app.get('/api/auth/user', ClerkExpressWithAuth(), async (req: any, res) => {
    try {
      if (!req.auth.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.auth.userId;
      let user = await storage.getUser(userId);

      if (!user) {
        // Fetch user details from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || "no-email@example.com";

        user = await storage.upsertUser({
          id: userId,
          email: email,
          firstName: clerkUser.firstName || "User",
          lastName: clerkUser.lastName || "",
          profileImageUrl: clerkUser.imageUrl || "",
        });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // RFID and occupancy routes (protected)
  app.get("/api/occupancy", ClerkExpressWithAuth(), async (req: any, res) => {
    if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const stats = await storage.calculateOccupancy();
      res.json(stats);
    } catch (error) {
      console.error("Error calculating occupancy:", error);
      res.status(500).json({ error: "Failed to calculate occupancy" });
    }
  });

  app.get("/api/rfid-logs", ClerkExpressWithAuth(), async (req: any, res) => {
    if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const logs = await storage.getTodayLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching RFID logs:", error);
      res.status(500).json({ error: "Failed to fetch RFID logs" });
    }
  });

  app.post("/api/rfid-logs", ClerkExpressWithAuth(), async (req: any, res) => {
    if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const validatedData = insertRfidLogSchema.parse(req.body);
      const log = await storage.addRfidLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error adding RFID log:", error);
        res.status(500).json({ error: "Failed to add RFID log" });
      }
    }
  });

  // Public simulation endpoint for development (no auth required for easier testing)
  app.get("/api/rfid-logs/simulate", async (req: any, res) => {
    try {
      const count = parseInt(req.query.count as string) || 1;
      const logs = [];

      for (let i = 0; i < count; i++) {
        // Get CURRENT occupancy and who's inside
        const currentStats = await storage.calculateOccupancy();
        const currentOccupancy = currentStats.current;
        const capacity = currentStats.capacity;

        // Get all today's logs to track who's currently inside
        const todayLogs = await storage.getTodayLogs();
        const userStates = new Map<string, string>();
        todayLogs.forEach((log) => {
          userStates.set(log.userId, log.action);
        });

        // Get list of users currently inside
        const usersInside = Array.from(userStates.entries())
          .filter(([_, action]) => action === "IN")
          .map(([userId, _]) => userId);

        let userId: string;
        let action: "IN" | "OUT";

        // Smart action selection
        if (currentOccupancy === 0) {
          // If empty, must enter
          userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`;
          action = "IN";
        } else if (currentOccupancy >= capacity * 0.9) {
          // Near capacity - pick someone inside to exit
          if (usersInside.length > 0) {
            userId = usersInside[Math.floor(Math.random() * usersInside.length)];
            action = "OUT";
          } else {
            // Fallback if somehow no one is tracked as inside
            userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`;
            action = "IN";
          }
        } else {
          // Normal occupancy - decide action first
          const shouldEnter = currentOccupancy < capacity * 0.3
            ? Math.random() < 0.7  // Low occupancy: 70% enter
            : Math.random() < 0.6; // Normal: 60% enter

          if (shouldEnter) {
            // New person entering
            userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`;
            action = "IN";
          } else {
            // Someone exiting - pick from people inside
            if (usersInside.length > 0) {
              userId = usersInside[Math.floor(Math.random() * usersInside.length)];
              action = "OUT";
            } else {
              // If no one inside, enter instead
              userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`;
              action = "IN";
            }
          }
        }

        const log = await storage.addRfidLog({ userId, action });
        logs.push(log);
      }

      const stats = await storage.calculateOccupancy();
      res.json({ logs, stats });
    } catch (error) {
      console.error("Error simulating RFID event:", error);
      res.status(500).json({ error: "Failed to simulate RFID event" });
    }
  });

  // Mock RFID endpoint (returns random event without saving)
  app.get("/api/rfid", (req: any, res) => {
    const userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`;
    const action = Math.random() > 0.5 ? "IN" : "OUT";
    res.json({ userId, action });
  });

  const httpServer = createServer(app);
  return httpServer;
}
