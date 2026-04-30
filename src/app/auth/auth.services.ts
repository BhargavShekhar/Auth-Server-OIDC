import { randomBytes, createHmac } from "crypto";

import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { usersTable } from "../../db/schema.js";
import ApiError from "../../common/api-error.js";
import type { signinDto, signupDto } from "./auth.model.js";
import { createUserToken } from "./utils/token.js";

class AuthenticationService {
    hashPassword(password: string, salt: string) {
        return createHmac("sha256", salt).update(password).digest("hex");
    }

    async validateCredentials({ email, password }: signinDto) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (!user) throw ApiError.notfound("Invalid Credentials");

        const hash = this.hashPassword(password, user.salt!);

        if (user.password !== hash) throw ApiError.forbidden("Invalid Credentials");

        return user.id;
    }

    async signup({ firstName, lastName, email, password }: signupDto) {
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (existingUser) throw ApiError.badRequest("User alredy exists");

        const salt = randomBytes(32).toString("hex");
        const hash = this.hashPassword(password, salt);

        const [result] = await db.insert(usersTable).values({
            firstName,
            lastName,
            email,
            password: hash,
            salt
        }).returning({ id: usersTable.id });

        if (!result) {
            throw ApiError.internal("User creation failed");
        }

        return result;
    }

    async signin({ email, password }: signinDto) {
        const userId = await this.validateCredentials({ email, password });

        const token = createUserToken({ id: userId });

        return { token };
    }

    async getMe(id: string) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));

        return {
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email
        };
    }
}

export default AuthenticationService;