import express from "express";
import ApiError from "../common/api-error.js";
import authRouter from "./auth/auth.routes.js";
import { authenticationMiddleware } from "./middleware/auth-middleware.js";
import oidcRouter from "./oidc/oidc.routes.js";
import type { Express, Request, Response, NextFunction } from "express";

function createExpressApplication(): Express {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/", oidcRouter);
    
    app.use(authenticationMiddleware());

    app.get("/health", (req, res) => res.json({ healthy: true }));

    app.use("/api/v1/auth", authRouter);

    app.use((req, res, next) => {
        next(ApiError.notfound("No such route exists"));
    })

    app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
        console.error(error);
        if (error instanceof ApiError) {
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                sucess: false,
                message: { error: error.message },
                data: null
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        })
    })

    return app;
}

export default createExpressApplication;