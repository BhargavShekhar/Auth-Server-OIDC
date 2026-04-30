import { randomBytes } from "node:crypto";
import AuthenticationService from "../auth/auth.services.js";
import { redis } from "../../redis/index.js";

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

    async exchangeCodeForToken({ code, client_id, client_secret }: {
        code: string,
        client_id: string,
        client_secret: string
    }) {
        
    }
}

export default OidcService;