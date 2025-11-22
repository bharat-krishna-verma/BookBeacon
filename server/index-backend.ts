import runApp from "./app";

// Backend-only entry point for Vercel deployment
// This version does not serve static files - only the API
(async () => {
    await runApp(async () => {
        // No static file serving for backend-only deployment
        // The frontend will be served from a separate Vercel project
    });
})();
