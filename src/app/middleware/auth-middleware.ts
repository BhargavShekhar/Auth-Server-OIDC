import type { Request, Response, NextFunction } from "express";
import ApiError from "../../common/api-error.js";
import { verifyUserToken } from "../auth/utils/token.js";

export function authenticationMiddleware() {
    return function (req: Request, res: Response, next: NextFunction) {
        const header = req.headers["authorization"];

        if (!header) return next();

        if (!header.startsWith("Bearer")) return next(ApiError.unauthorized("Malformed authorization header"));

        const token = header.split(" ")[1];

        console.log(token);

        if (!token) return next(ApiError.forbidden("Invalid token"));

        try {
            const { id } = verifyUserToken(token)
            req.user.id = id;
            next();
        } catch (error) {
            console.error(error);
            return next(ApiError.unauthorized("Invalid or expired token"));
        }
    }
}

export function restrictToAuthenticatedUser() {
    return function (req: Request, res: Response, next: NextFunction) {
        if (!req.user?.id) next(ApiError.unauthorized("Authentication required"));
        next();
    }
}