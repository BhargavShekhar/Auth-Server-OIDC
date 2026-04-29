import { Router } from "express";
import AuthenticationController from "./auth.controlers.js";
import { restrictToAuthenticatedUser } from "../middleware/auth-middleware.js";

const authenticationContoller = new AuthenticationController();

const router: Router = Router();

router.post("/signup", authenticationContoller.handleSignup.bind(authenticationContoller));
router.post("/signin", authenticationContoller.handleSignin.bind(authenticationContoller));

router.get("/me", restrictToAuthenticatedUser(), authenticationContoller.handleGetMe.bind(authenticationContoller));

export default router;