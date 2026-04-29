import type { Request, Response } from "express";
import { signupPayloadModel, type signupDto } from "./auth.model.js";
import ApiError from "../../common/api-error.js";
import AuthenticationService from "./auth.services.js";
import ApiResponse from "../../common/api-response.js";

class AuthenticationController {
    private authService = new AuthenticationService();

    public async handleSignup(req: Request, res: Response) {
        const validationResult = signupPayloadModel.safeParse(req.body);

        if (!validationResult.success) throw ApiError.badRequest("Validation failed");

        const data: signupDto = validationResult.data;

        const result = await this.authService.signup(data)

        return ApiResponse.created(res, "User created successfully", result);
    }
}

export default AuthenticationController;