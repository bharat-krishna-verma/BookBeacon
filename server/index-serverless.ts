import { app } from "./app";
import { registerRoutes } from "./routes";

// Initialize routes and export for Vercel serverless
let initialized = false;

export default async (req: any, res: any) => {
    if (!initialized) {
        await registerRoutes(app);
        initialized = true;
    }
    return app(req, res);
};
