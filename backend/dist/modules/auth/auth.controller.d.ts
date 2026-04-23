import { Request, Response } from 'express';
export declare class AuthController {
    /**
     * Register new user
     * POST /api/v1/auth/register
     */
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Login user
     * POST /api/v1/auth/login
     */
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Refresh access token
     * POST /api/v1/auth/refresh
     */
    refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Logout user
     * POST /api/v1/auth/logout
     */
    logout(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get current user
     * GET /api/v1/auth/me
     */
    getCurrentUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map