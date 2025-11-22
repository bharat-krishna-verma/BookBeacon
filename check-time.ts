import "dotenv/config";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { db } from "./server/db";
import { rfidLogs } from "./shared/schema";
import { sql } from "drizzle-orm";

async function checkTime() {
    console.log("Server Time:", new Date().toISOString());

    const dbTime = await db.execute(sql`SELECT NOW() as db_time`);
    console.log("DB Time:", dbTime.rows[0].db_time);

    const recentLogs = await db.select().from(rfidLogs).orderBy(sql`${rfidLogs.timestamp} DESC`).limit(5);
    console.log("Recent Logs:", recentLogs);

    process.exit(0);
}

checkTime().catch(console.error);
