import jwt from "jsonwebtoken";

export interface UserTokenPayload {
    id: string
}

export function createUserToken(payload: UserTokenPayload) {
    console.log("SIGN SECRET:", process.env.JWT_SECRET);
    const token = jwt.sign(payload, process.env.JWT_SECRET!);
    return token;
}

export function verifyUserToken(token: string) {
    console.log("SIGN SECRET:", process.env.JWT_SECRET);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserTokenPayload;
    return payload;
}