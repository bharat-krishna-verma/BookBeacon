import "dotenv/config";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { Pool } from "pg";

console.log("Testing DB Connection...");
console.log("URL:", process.env.DATABASE_URL?.replace(/:[^:@]*@/, ":***@"));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        const client = await pool.connect();
        console.log("Connected successfully!");
        const res = await client.query("SELECT NOW()");
        console.log("Time:", res.rows[0]);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}

test();
