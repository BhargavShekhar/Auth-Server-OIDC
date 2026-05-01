import { readFileSync } from "node:fs";
import ApiError from "../../common/api-error.js";
import ApiResponse from "../../common/api-response.js";
import OidcService from "./oidc.services.js";
import type { Request, Response } from "express";
import path from "node:path";

class OidcController {
    private oidcService = new OidcService();
    private loginTempleate = readFileSync(path.join(process.cwd(), "public/login.html"), "utf-8");

    private escapeHtml(value: string) {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#039;");
    }

    public async handleAuthorization(req: Request, res: Response) {
        const { client_id, redirect_uri, response_type, state, code_challenge, code_challenge_method } = req.query;

        if (!client_id || !redirect_uri || !response_type || !state || !code_challenge || !code_challenge_method)
            throw ApiError.badRequest("Missing required parameters");

        if (code_challenge_method !== "S256") throw ApiError.badRequest("Only SHA256 is supported");

        if (response_type !== "code") throw ApiError.badRequest("Unsupported response type");

        await this.oidcService.validateClient(client_id as string, redirect_uri as string); // validate if client is registered

        const html = this.loginTempleate
            .replace("__CLIENT_ID__", this.escapeHtml(client_id as string))
            .replace("__REDIRECT_URI__", this.escapeHtml(redirect_uri as string))
            .replace("__STATE__", this.escapeHtml(state as string))
            .replace("__code_challenge__", this.escapeHtml(code_challenge as string));

        return res.send(html);
    }

    public async handleAuthorizationSubmit(req: Request, res: Response) {
        const { client_id, redirect_uri, state, code_challenge, email, password } = req.body;

        if (!client_id || !redirect_uri || !state || !code_challenge || !email || !password) throw ApiError.badRequest("Missing required parameters");

        const code = await this.oidcService.validateAndGenerateAuthCode({ email, password, code_challenge });

        return res.redirect(`${redirect_uri}?code=${code}&state=${state}`);
    }

    public async handleToken(req: Request, res: Response) {
        const { grant_type, code, client_id, client_secret, code_verifier } = req.body;

        if (grant_type !== "authorization_code") throw ApiError.badRequest("unsupported_grant_type");

        if (!code || !client_id || !client_secret) throw ApiError.badRequest("Missing required parameters");

        const tokens = await this.oidcService.exchangeCodeForToken({
            client_id,
            client_secret,  
            code,
            code_verifier
        });

        return ApiResponse.ok(res, "tokens generated sucessfully", { tokens });
    }

    public async handleJwks(req: Request, res: Response) {
        const jwks = this.oidcService.getJwks();
        return res.json(jwks);
    }
}

export default OidcController;