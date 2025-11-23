var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/app.ts
import express from "express";

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
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
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

// server/index-serverless.ts
import { ClerkExpressWithAuth as ClerkExpressWithAuth2, clerkClient as clerkClient2 } from "@clerk/clerk-sdk-node";
import { z as z3 } from "zod";
app.get("/api/auth/user", ClerkExpressWithAuth2(), async (req, res) => {
  try {
    if (!req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.auth.userId;
    let user = await storage.getUser(userId);
    if (!user) {
      const clerkUser = await clerkClient2.users.getUser(userId);
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
app.get("/api/occupancy", ClerkExpressWithAuth2(), async (req, res) => {
  if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const stats = await storage.calculateOccupancy();
    res.json(stats);
  } catch (error) {
    console.error("Error calculating occupancy:", error);
    res.status(500).json({ error: "Failed to calculate occupancy" });
  }
});
app.get("/api/rfid-logs", ClerkExpressWithAuth2(), async (req, res) => {
  if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const logs = await storage.getTodayLogs();
    res.json(logs);
  } catch (error) {
    console.error("Error fetching RFID logs:", error);
    res.status(500).json({ error: "Failed to fetch RFID logs" });
  }
});
app.post("/api/rfid-logs", ClerkExpressWithAuth2(), async (req, res) => {
  if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const validatedData = insertRfidLogSchema.parse(req.body);
    const log2 = await storage.addRfidLog(validatedData);
    res.status(201).json(log2);
  } catch (error) {
    if (error instanceof z3.ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    } else {
      console.error("Error adding RFID log:", error);
      res.status(500).json({ error: "Failed to add RFID log" });
    }
  }
});
app.get("/api/rfid-logs/simulate", async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 1;
    const logs = [];
    for (let i = 0; i < count; i++) {
      const currentStats = await storage.calculateOccupancy();
      const currentOccupancy = currentStats.current;
      const capacity = currentStats.capacity;
      const todayLogs = await storage.getTodayLogs();
      const userStates = /* @__PURE__ */ new Map();
      todayLogs.forEach((log3) => {
        userStates.set(log3.userId, log3.action);
      });
      const usersInside = Array.from(userStates.entries()).filter(([_, action2]) => action2 === "IN").map(([userId2, _]) => userId2);
      let userId;
      let action;
      if (currentOccupancy === 0) {
        userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`;
        action = "IN";
      } else if (currentOccupancy >= capacity * 0.9) {
        if (usersInside.length > 0) {
          userId = usersInside[Math.floor(Math.random() * usersInside.length)];
          action = "OUT";
        } else {
          userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`;
          action = "IN";
        }
      } else {
        const shouldEnter = currentOccupancy < capacity * 0.3 ? Math.random() < 0.7 : Math.random() < 0.6;
        if (shouldEnter) {
          userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`;
          action = "IN";
        } else {
          if (usersInside.length > 0) {
            userId = usersInside[Math.floor(Math.random() * usersInside.length)];
            action = "OUT";
          } else {
            userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`;
            action = "IN";
          }
        }
      }
      const log2 = await storage.addRfidLog({ userId, action });
      logs.push(log2);
    }
    const stats = await storage.calculateOccupancy();
    res.json({ logs, stats });
  } catch (error) {
    console.error("Error simulating RFID event:", error);
    res.status(500).json({ error: "Failed to simulate RFID event" });
  }
});
app.get("/api/rfid", (req, res) => {
  const userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`;
  const action = Math.random() > 0.5 ? "IN" : "OUT";
  res.json({ userId, action });
});
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
var index_serverless_default = app;
export {
  index_serverless_default as default
};
