import { randomBytes, createHmac } from "crypto";

import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { usersTable } from "../../db/schema.js";
import ApiError from "../../common/api-error.js";
import type { signupDto } from "./auth.model.js";

class AuthenticationService {
    async signup({ firstName, lastName, email, password }: signupDto) {
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (existingUser) throw ApiError.badRequest("User alredy exists");

        const salt = randomBytes(32).toString("hex");
        const hash = createHmac("sha256", salt).update(password).digest("hex");

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
}

export default AuthenticationService;