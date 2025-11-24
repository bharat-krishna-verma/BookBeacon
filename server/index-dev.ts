import "dotenv/config";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { type Server } from "node:http";
import { type Express } from "express";
import runApp from "./app";

// Simple setup for API-only server (no Vite middleware needed)
export async function setupApiOnly(_app: Express, _server: Server) {
  // No additional setup needed - just serve the API
  console.log("API server running in development mode");
}

(async () => {
  await runApp(setupApiOnly);
})();
