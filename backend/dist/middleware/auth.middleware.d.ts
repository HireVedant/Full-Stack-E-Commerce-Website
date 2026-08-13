import { Request, Response, NextFunction } from "express";
export declare const JWT_SECRET: string;
export interface AuthPayload {
    id: number;
    role: "user" | "admin";
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map