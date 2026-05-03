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
        const { grant_type, code, client_id, client_secret, code_verifier, refresh_token } = req.body;

        if (grant_type === "authorization_code") {
            if (!code || !code_verifier) {
                throw ApiError.badRequest("Missing code or code_verifier");
            }

            const tokens = await this.oidcService.exchangeCodeForToken({
                client_id,
                client_secret,
                code,
                code_verifier
            });

            return res.json(tokens);
        }

        if (grant_type === "refresh_token") {
            if (!refresh_token) {
                throw ApiError.badRequest("Missing refresh_token");
            }

            const tokens = await this.oidcService.refreshTokens({
                refreshToken: refresh_token,
                client_id,
                client_secret
            });

            return res.json(tokens);
        }


    }

    public async handleJwks(req: Request, res: Response) {
        const jwks = this.oidcService.getJwks();
        return ApiResponse.ok(res, "Fetch successfull", jwks);
    }

    public async handleUserInfo(req: Request, res: Response) {
        const authHeader = req.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer")) throw ApiError.badRequest("Bearer token required");

        const token = authHeader.split(" ")[1];

        if (!token) throw ApiError.badRequest("Invalid token required");

        const result = await this.oidcService.userInfo(token);

        return res.status(200).json(result);
    }
}

export default OidcController;