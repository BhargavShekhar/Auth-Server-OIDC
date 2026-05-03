import ApiError from "../../common/api-error.js";
import AuthenticationService from "./auth.services.js";
import ApiResponse from "../../common/api-response.js";
import { signinPayloadModel, signupPayloadModel } from "./auth.model.js";
import type { signinDto, signupDto } from "./auth.model.js";
import type { Request, Response } from "express";

class AuthenticationController {
    private authService = new AuthenticationService();

    public async handleSignup(req: Request, res: Response) {
        const validationResult = signupPayloadModel.safeParse(req.body);

        if (!validationResult.success) throw ApiError.badRequest("Validation failed");

        const data: signupDto = validationResult.data;

        const result = await this.authService.signup(data)

        return ApiResponse.created(res, "User created successfully", result);
    }

    public async handleSignin(req: Request, res: Response) {
        const validationResult = signinPayloadModel.safeParse(req.body);

        if (!validationResult.success) throw ApiError.badRequest("Validation failed");

        const data: signinDto = validationResult.data;

        const result = await this.authService.signin(data);

        return ApiResponse.ok(res, "Signin successfully", result);
    }

    public async handleRefresh(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (!refreshToken) throw ApiError.badRequest("Refresh token required");

        const result = await this.authService.refresh(refreshToken);

        return ApiResponse.ok(res, "Token refreshed successfully", result);
    }

    public async handleGetMe(req: Request, res: Response) {
        const result = await this.authService.getMe(req.user!.id);

        return ApiResponse.ok(res, "User fetched successfully", {
            firstName: result?.firstName,
            lastName: result?.lastName,
            email: result?.email
        });
    }
}

export default AuthenticationController;