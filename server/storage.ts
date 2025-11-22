import { type RfidLog, type InsertRfidLog, type OccupancyStats, type User, type UpsertUser, rfidLogs, users } from "@shared/schema";
import { db } from "./db";
import { eq, gte } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // RFID operations
  addRfidLog(log: InsertRfidLog): Promise<RfidLog>;
  getRfidLogs(): Promise<RfidLog[]>;
  getTodayLogs(): Promise<RfidLog[]>;
  calculateOccupancy(): Promise<OccupancyStats>;
}

export class DatabaseStorage implements IStorage {
  private readonly CAPACITY = 100;

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

  async addRfidLog(insertLog: InsertRfidLog): Promise<RfidLog> {
    const [log] = await db
      .insert(rfidLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getRfidLogs(): Promise<RfidLog[]> {
    return await db
      .select()
      .from(rfidLogs)
      .orderBy(rfidLogs.timestamp);
  }

  async getTodayLogs(): Promise<RfidLog[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return await db
      .select()
      .from(rfidLogs)
      .where(gte(rfidLogs.timestamp, today))
      .orderBy(rfidLogs.timestamp);
  }

  async calculateOccupancy(): Promise<OccupancyStats> {
    const todayLogs = await this.getTodayLogs();
    
    const userStates = new Map<string, string>();
    let peakOccupancy = 0;
    let currentOccupancy = 0;
    let totalIn = 0;
    let totalOut = 0;

    todayLogs.forEach((log) => {
      if (log.action === "IN") {
        totalIn++;
        if (!userStates.has(log.userId) || userStates.get(log.userId) === "OUT") {
          userStates.set(log.userId, "IN");
          currentOccupancy++;
          peakOccupancy = Math.max(peakOccupancy, currentOccupancy);
        }
      } else if (log.action === "OUT") {
        totalOut++;
        if (userStates.get(log.userId) === "IN") {
          userStates.set(log.userId, "OUT");
          currentOccupancy--;
        }
      }
    });

    const current = Array.from(userStates.values()).filter((state) => state === "IN").length;
    const percentage = Math.round((current / this.CAPACITY) * 100);
    
    let status: "low" | "medium" | "high" = "low";
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
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const storage = new DatabaseStorage();
