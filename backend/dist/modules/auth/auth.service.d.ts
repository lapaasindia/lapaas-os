import jwt from 'jsonwebtoken';
interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
interface LoginPayload {
    email: string;
    password: string;
}
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class AuthService {
    private jwtSecret;
    private jwtExpiry;
    private refreshExpiry;
    /**
     * Register a new user
     */
    register(payload: RegisterPayload): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        createdAt: any;
    }>;
    /**
     * Login user with email and password
     */
    login(payload: LoginPayload): Promise<AuthTokens & {
        user: any;
    }>;
    /**
     * Generate JWT tokens
     */
    private generateTokens;
    /**
     * Create user session
     */
    private createSession;
    /**
     * Verify JWT token
     */
    verifyToken(token: string): string | jwt.JwtPayload;
    /**
     * Refresh access token
     */
    refreshAccessToken(refreshToken: string): Promise<AuthTokens>;
    /**
     * Logout user
     */
    logout(userId: string): Promise<void>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map