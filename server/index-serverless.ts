import { app } from "./app";
import { registerRoutes } from "./routes";

// Initialize routes
await registerRoutes(app);

// Export the Express app for Vercel serverless
export default app;
