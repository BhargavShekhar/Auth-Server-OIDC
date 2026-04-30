import { createPublicKey, randomBytes } from "node:crypto";
import AuthenticationService from "../auth/auth.services.js";
import { redis } from "../../redis/index.js";
import { db } from "../../db/index.js";
import { oidcClientsTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import ApiError from "../../common/api-error.js";
import { createUserToken } from "../auth/utils/token.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

class OidcService {
    private authService = new AuthenticationService();

    async generateAuthCode({ email, password }: {
        email: string,
        password: string,
    }) {
        const userId = await this.authService.validateCredentials({ email, password });

        const code = randomBytes(32).toString("hex");

        await redis.set(`code:${code}`, userId, "EX", 60);

        return code;
    }

    async validateClient(client_id: string, redirect_uri: string) {
        const [client] = await db.select().from(oidcClientsTable).where(eq(oidcClientsTable.clientId, client_id));

        if (!client) throw ApiError.unauthorized("Unkown client");

        if (!client.redirectUris.includes(redirect_uri)) throw ApiError.badRequest("Invalid redirect_uri");

        return client;
    }

    async validateClientWithSecret(client_id: string, client_secret: string) {
        const [client] = await db.select().from(oidcClientsTable).where(eq(oidcClientsTable.clientId, client_id));

        if (!client) throw ApiError.unauthorized("Unkown client");

        if (client.clientSecret !== client_secret) throw ApiError.unauthorized("Invalid client secret");

        return;
    }

    async exchangeCodeForToken({ code, client_id, client_secret }: {
        code: string,
        client_id: string,
        client_secret: string
    }) {
        await this.validateClientWithSecret(client_id, client_secret);

        const userId = await redis.get(`code:${code}`);

        if (!userId) throw ApiError.badRequest("Invalid or expired code");

        await redis.del(`code:${code}`);

        const user = await this.authService.getMe(userId);

        const id_token = createUserToken({
            id: userId,
            email: user.email!,
            firstName: user.firstName!
        });

        const access_token = createUserToken({ id: userId });

        return {
            access_token,
            id_token,
            token_type: "Bearer",
            expires_in: 900
        }
    }
    
    getJwks() {
        const publicKey = readFileSync(join(process.cwd(), "keys", "public.key"), "utf-8");

        const keyObj = createPublicKey(publicKey);
        const jwk = keyObj.export({ format: "jwk" });

        return {
            keys: [{
                ...jwk,
                use: "sig", // this key is for signature verification
                alg: "RS256",
                kid: "auth-server-key-1" // key ID — useful when rotating keys
            }]
        }
    }
}

export default OidcService;