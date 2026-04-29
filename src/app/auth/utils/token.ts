import jwt from "jsonwebtoken";

export interface UserTokenPayload {
    id: string
}

export function createUserToken(payload: UserTokenPayload) {
    const token = jwt.sign(payload, process.env.JWT_SECRET!);
    return token;
}

export function verifyUserToken(token: string) {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserTokenPayload;
    return payload;
}