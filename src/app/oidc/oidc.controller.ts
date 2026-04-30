import ApiError from "../../common/api-error.js";
import ApiResponse from "../../common/api-response.js";
import OidcService from "./oidc.services.js";
import type { Request, Response } from "express";

class OidcController {
    private oidcService = new OidcService();

    public async handleAuthorization(req: Request, res: Response) {
        const { client_id, redirect_uri, response_type, state } = req.query;

        if (!client_id || !redirect_uri || !response_type || !state) throw ApiError.badRequest("Missing required parameters");

        if (response_type !== "code") throw ApiError.badRequest("Unsupported response type");

        await this.oidcService.validateClient(client_id as string, redirect_uri as string); // validate if client is registered

        return res.send(`
            <html>
                <body>
                    <h2>Login to continue</h2>
                    <form method="POST" action="/authorize">
                        <input type="hidden" name="client_id" value="${client_id}" />
                        <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
                        <input type="hidden" name="state" value="${state}" />
                        <input type="email" name="email" placeholder="Email" required /><br/>
                        <input type="password" name="password" placeholder="Password" required /><br/>
                        <button type="submit">Login</button>
                    </form>
                </body>
            </html>
        `);
    }

    public async handleAuthorizationSubmit(req: Request, res: Response) {
        const { client_id, redirect_uri, state, email, password } = req.body;

        if (!client_id || !redirect_uri || !state || !email || !password) throw ApiError.badRequest("Missing required parameters");

        const code = await this.oidcService.validateAndGenerateAuthCode({ email, password }); // also validates the user

        return res.redirect(`${redirect_uri}?code=${code}&state=${state}`);
    }

    public async handleToken(req: Request, res: Response) {
        const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

        if (grant_type !== "authorization_code") throw ApiError.badRequest("unsupported_grant_type");

        if (!code || !client_id || !client_secret) throw ApiError.badRequest("Missing required parameters");

        const tokens = await this.oidcService.exchangeCodeForToken({
            client_id,
            client_secret,
            code
        });

        return ApiResponse.ok(res, "tokens generated sucessfully", { tokens });
    }

    public async handleJwks(req: Request, res: Response) {
        const jwks = this.oidcService.getJwks();
        return res.json(jwks);
    }
}

export default OidcController;