import { Router } from "express";
import AuthenticationController from "./auth.controlers.js";

const authenticationContoller = new AuthenticationController();

const router: Router = Router();

router.post("/signup", authenticationContoller.handleSignup.bind(authenticationContoller))

export default router;