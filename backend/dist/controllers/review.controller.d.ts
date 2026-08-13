import { Request, Response } from "express";
import { ReviewService } from "../services/review.service";
export declare function makeReviewControllers(svc: ReviewService): {
    getByProduct: (req: Request, res: Response) => void;
    create: (req: Request, res: Response) => void;
};
//# sourceMappingURL=review.controller.d.ts.map