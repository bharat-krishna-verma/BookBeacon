import "dotenv/config";
import { db } from "./db";
import { users, rfidLogs, type InsertRfidLog } from "@shared/schema";
import { randomUUID } from "crypto";

async function seed() {
    console.log("Seeding database...");

    // 1. Create Mock Users
    const mockUsers = [
        {
            id: "USER001",
            email: "alice@example.com",
            firstName: "Alice",
            lastName: "Smith",
            profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        },
        {
            id: "USER002",
            email: "bob@example.com",
            firstName: "Bob",
            lastName: "Jones",
            profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        },
        {
            id: "USER003",
            email: "charlie@example.com",
            firstName: "Charlie",
            lastName: "Brown",
            profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
        },
        {
            id: "USER004",
            email: "diana@example.com",
            firstName: "Diana",
            lastName: "Prince",
            profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
        },
        {
            id: "USER005",
            email: "evan@example.com",
            firstName: "Evan",
            lastName: "Wright",
            profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan",
        },
    ];

    for (const user of mockUsers) {
        await db.insert(users).values(user).onConflictDoUpdate({
            target: users.id,
            set: user,
        });
    }
    console.log("Mock users created.");

    // 2. Generate RFID Logs for Today
    // We want to simulate some activity throughout the day
    const logs: InsertRfidLog[] = [];
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0); // 8 AM

    // Simulate 50 events
    for (let i = 0; i < 50; i++) {
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const action = Math.random() > 0.5 ? "IN" : "OUT";

        // Random time between 8 AM and now
        const timeOffset = Math.random() * (now.getTime() - startOfDay.getTime());
        const timestamp = new Date(startOfDay.getTime() + timeOffset);

        logs.push({
            userId: randomUser.id,
            action: action as "IN" | "OUT",
            // We can't easily set timestamp in insert with defaultNow() schema, 
            // but for seeding we might want to. 
            // However, the schema defines timestamp as defaultNow(). 
            // Let's just insert them and they will have current time if we don't override,
            // OR we need to update schema to allow inserting timestamp if it's not there.
            // Actually, the schema definition `timestamp("timestamp").notNull().defaultNow()` 
            // allows providing a date.
        });
    }

    // Bulk insert isn't easily supported with varying timestamps if we want them distributed.
    // But for simplicity, let's just add them one by one with a small delay or just let them all be "now" 
    // which might look weird on a chart but okay for occupancy count.
    // BETTER: Let's just insert them. The chart might show them all at once.
    // To make it look real, we should probably just insert a few recent ones.

    // Let's just insert 10 recent logs.
    for (let i = 0; i < 10; i++) {
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const action = i % 2 === 0 ? "IN" : "OUT"; // Alternate to keep balance roughly
        await db.insert(rfidLogs).values({
            userId: randomUser.id,
            action: action as "IN" | "OUT",
        });
    }

    console.log("Mock RFID logs created.");
    console.log("Seeding complete.");
}

seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
