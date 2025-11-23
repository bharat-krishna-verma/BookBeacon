// Vercel Serverless Function Entry Point
const { app } = require('../server/app.js');
const { registerRoutes } = require('../server/routes.js');

let initialized = false;

module.exports = async (req, res) => {
    // Initialize routes once
    if (!initialized) {
        await registerRoutes(app);
        initialized = true;
    }

    // Handle the request with Express
    return app(req, res);
};
