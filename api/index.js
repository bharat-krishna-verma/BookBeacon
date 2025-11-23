import { app } from '../server/app.js';
import { registerRoutes } from '../server/routes.js';

// Initialize routes for serverless function
await registerRoutes(app);

// Export the Express app as a serverless function
export default app;
