import type Database from "better-sqlite3";
import { type CreateReviewInput, type Review } from "../models/review.model";
export declare class ReviewService {
    private db;
    private userService;
    constructor(db?: Database.Database);
    create(userId: number, input: CreateReviewInput): Review;
    getByProductId(productId: number): Review[];
    getAverageRating(productId: number): {
        average: number;
        count: number;
    };
}
//# sourceMappingURL=review.service.d.ts.map