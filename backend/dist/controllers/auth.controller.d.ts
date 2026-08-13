import { Request, Response } from "express";
import { UserService } from "../services/user.service";
export declare function makeAuthControllers(svc: UserService): {
    register: (req: Request, res: Response) => void;
    login: (req: Request, res: Response) => void;
    getProfile: (req: Request, res: Response) => void;
};
//# sourceMappingURL=auth.controller.d.ts.map