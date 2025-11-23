var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index-prod.ts
import fs from "node:fs";
import path from "node:path";
import express2 from "express";

// server/app.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertRfidLogSchema: () => insertRfidLogSchema,
  rfidLogs: () => rfidLogs,
  sessions: () => sessions,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var rfidLogs = pgTable("rfid_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow()
});
var insertRfidLogSchema = createInsertSchema(rfidLogs).omit({
  id: true,
  timestamp: true
}).extend({
  action: z.enum(["IN", "OUT"])
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
console.log("DB Config:", {
  connectionString: process.env.DATABASE_URL?.replace(/:[^:@]*@/, ":***@"),
  // Hide password
  ssl: { rejectUnauthorized: false },
  NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED
});
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, gte } from "drizzle-orm";
var DatabaseStorage = class {
  CAPACITY = 100;
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async addRfidLog(insertLog) {
    const [log2] = await db.insert(rfidLogs).values(insertLog).returning();
    return log2;
  }
  async getRfidLogs() {
    return await db.select().from(rfidLogs).orderBy(rfidLogs.timestamp);
  }
  async getTodayLogs() {
    const now = /* @__PURE__ */ new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return await db.select().from(rfidLogs).where(gte(rfidLogs.timestamp, today)).orderBy(rfidLogs.timestamp);
  }
  async calculateOccupancy() {
    const todayLogs = await this.getTodayLogs();
    const userStates = /* @__PURE__ */ new Map();
    let peakOccupancy = 0;
    let currentOccupancy = 0;
    let totalIn = 0;
    let totalOut = 0;
    todayLogs.forEach((log2) => {
      if (log2.action === "IN") {
        totalIn++;
        if (!userStates.has(log2.userId) || userStates.get(log2.userId) === "OUT") {
          userStates.set(log2.userId, "IN");
          currentOccupancy++;
          peakOccupancy = Math.max(peakOccupancy, currentOccupancy);
        }
      } else if (log2.action === "OUT") {
        totalOut++;
        if (userStates.get(log2.userId) === "IN") {
          userStates.set(log2.userId, "OUT");
          currentOccupancy--;
        }
      }
    });
    const current = Array.from(userStates.values()).filter((state) => state === "IN").length;
    const percentage = Math.round(current / this.CAPACITY * 100);
    let status = "low";
    if (percentage >= 70) {
      status = "high";
    } else if (percentage >= 30) {
      status = "medium";
    }
    return {
      current,
      totalIn,
      totalOut,
      peak: peakOccupancy,
      capacity: this.CAPACITY,
      percentage,
      status,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { ClerkExpressWithAuth, clerkClient } from "@clerk/clerk-sdk-node";
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/auth/user", ClerkExpressWithAuth(), async (req, res) => {
    try {
      if (!req.auth.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = req.auth.userId;
      let user = await storage.getUser(userId);
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || "no-email@example.com";
        user = await storage.upsertUser({
          id: userId,
          email,
          firstName: clerkUser.firstName || "User",
          lastName: clerkUser.lastName || "",
          profileImageUrl: clerkUser.imageUrl || ""
        });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/occupancy", ClerkExpressWithAuth(), async (req, res) => {
    if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const stats = await storage.calculateOccupancy();
      res.json(stats);
    } catch (error) {
      console.error("Error calculating occupancy:", error);
      res.status(500).json({ error: "Failed to calculate occupancy" });
    }
  });
  app2.get("/api/rfid-logs", ClerkExpressWithAuth(), async (req, res) => {
    if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const logs = await storage.getTodayLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching RFID logs:", error);
      res.status(500).json({ error: "Failed to fetch RFID logs" });
    }
  });
  app2.post("/api/rfid-logs", ClerkExpressWithAuth(), async (req, res) => {
    if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const validatedData = insertRfidLogSchema.parse(req.body);
      const log2 = await storage.addRfidLog(validatedData);
      res.status(201).json(log2);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error adding RFID log:", error);
        res.status(500).json({ error: "Failed to add RFID log" });
      }
    }
  });
  app2.get("/api/rfid-logs/simulate", async (req, res) => {
    try {
      const count = parseInt(req.query.count) || 1;
      const results = [];
      for (let i = 0; i < count; i++) {
        const actions = ["IN", "OUT"];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const userId = `USER${String(Math.floor(Math.random() * 5) + 1).padStart(3, "0")}`;
        const log2 = await storage.addRfidLog({ userId, action });
        results.push(log2);
      }
      const stats = await storage.calculateOccupancy();
      res.json({ logs: results, stats });
    } catch (error) {
      console.error("Error simulating RFID event:", error);
      res.status(500).json({ error: "Failed to simulate RFID event" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/app.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express();
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function runApp(setup) {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  await setup(app, server);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
}

// server/index-prod.ts
async function serveStatic(app2, _server) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
(async () => {
  await runApp(serveStatic);
})();
export {
  serveStatic
};
