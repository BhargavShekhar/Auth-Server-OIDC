import crypto from "crypto";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import jwt from "jsonwebtoken";

export interface UserTokenPayload {
    id: string,
    email?: string,
    firstName?: string
}

const publicKey = readFileSync(join(process.cwd(), "keys", "public.key"), "utf-8");
const privateKey = readFileSync(join(process.cwd(), "keys", "private.key"), "utf-8");

export function createUserToken(payload: UserTokenPayload) {
    const token = jwt.sign(
        payload,
        privateKey,
        {
            algorithm: "RS256",
            expiresIn: '15m'
        }
    );
    return token;
}

export function verifyUserToken(token: string) {
    const payload = jwt.verify(
        token,
        publicKey,
        { algorithms: ["RS256"] }
    ) as UserTokenPayload;
    return payload;
}

export function createRefreshToken() {
    const refreshToken = crypto.randomBytes(32).toString("hex");
    return refreshToken;
}

export function hashToken(token: string) {
    const hash = createHash("sha256").update(token).digest("hex");
    return hash;
}