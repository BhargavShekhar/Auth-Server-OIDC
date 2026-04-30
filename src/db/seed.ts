import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { oidcClientsTable, usersTable } from "./schema.js";

async function seedDatabase() {
    const [oidcClient] = await db.select().from(oidcClientsTable).where(eq(oidcClientsTable.clientId, "checkboxes-app"));

    if (!oidcClient) {
        await db.insert(oidcClientsTable).values({
            clientId: "checkboxes-app",
            clientSecret: process.env.CHECKBOXES_CLIENT_SECRET!,
            name: "Checkboxes Application",
            redirectUris: ["http://localhost:3000/callback"]
        });
    }

    const [testUser] = await db.select().from(usersTable).where(eq(usersTable.email, "test@test.com"));

    if (!testUser) {
        await db.insert(usersTable).values({
            firstName: "test",
            lastName: "user",
            email: "test@test.com",
            password: "123123"
        })
    }
}

seedDatabase()
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => process.exit(1));