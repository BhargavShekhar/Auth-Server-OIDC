import { Router } from "express";
import OidcController from "./oidc.controller.js";

const router: Router = Router();
const oidcController = new OidcController();

// discovery endpoint
router.get("/.well-known/openid-configuration", (req, res) => {
    const issuer = process.env.ISSUER_URL!;

    res.json({
        issuer, // identity of this auth server
        authorization_endpoint: `${issuer}/authorize`, // where the browser will get redirected for login
        token_endpoint: `${issuer}/token`, // differnent server will call to exchange the auth code for tokens
        jwks_uri: `${issuer}/.well-known/jwks.json`, // where the public keys live so other servers can verify JWTs
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["HS256"]
    })
})

router.get("/authorize", oidcController.handleAuthorization.bind(oidcController));
router.post("/authorize", oidcController.handleAuthorizationSubmit.bind(oidcController));

router.post("/token", oidcController.handleToken.bind(oidcController));

router.get("/.well-known/jwks.json", oidcController.handleJwks.bind(oidcController));

export default router;