import { Router } from "express";
import AuthenticationController from "./auth.controlers.js";

const authenticationContoller = new AuthenticationController();

const router: Router = Router();

router.post("/signup", authenticationContoller.handleSignup.bind(authenticationContoller));
router.post("/signin", authenticationContoller.handleSignin.bind(authenticationContoller));

export default router;