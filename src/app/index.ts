import express from "express";
import type { Express } from "express";

function createExpressApplication(): Express {
    const app = express();

     app.use(express.json());

     app.get("/health", (req, res) => res.json({ healthy: true }));

    return app;
}

export default createExpressApplication;