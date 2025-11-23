import { app } from '../server/app.js';
import { storage } from '../server/storage.js';
import { ClerkExpressWithAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { insertRfidLogSchema } from '../shared/schema.js';
import { z } from 'zod';

// Auth routes
app.get('/api/auth/user', ClerkExpressWithAuth(), async (req, res) => {
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

// RFID routes
app.get("/api/occupancy", ClerkExpressWithAuth(), async (req, res) => {
    if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
        const stats = await storage.calculateOccupancy();
        res.json(stats);
    } catch (error) {
        console.error("Error calculating occupancy:", error);
        res.status(500).json({ error: "Failed to calculate occupancy" });
    }
});

app.get("/api/rfid-logs", ClerkExpressWithAuth(), async (req, res) => {
    if (!req.auth.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
        const logs = await storage.getTodayLogs();
        res.json(logs);
    } catch (error) {
        console.error("Error fetching RFID logs:", error);
        res.status(500).json({ error: "Failed to fetch RFID logs" });
    }
});

app.post("/api/rfid-logs", ClerkExpressWithAuth(), async (req, res) => {
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

// Mock RFID endpoint (no auth required)
app.get("/api/rfid", (req, res) => {
    const userId = `USER${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`;
    const action = Math.random() > 0.5 ? "IN" : "OUT";
    res.json({ userId, action });
});

// Error handler
app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
});

// Export for Vercel
export default app;
