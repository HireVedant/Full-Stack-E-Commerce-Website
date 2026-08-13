"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const connection_1 = require("../db/connection");
const review_model_1 = require("../models/review.model");
const user_service_1 = require("./user.service");
class ReviewService {
    constructor(db) {
        this.db = db ?? (0, connection_1.getDb)();
        this.userService = new user_service_1.UserService(this.db);
    }
    create(userId, input) {
        // Only one review per product per user
        const existing = this.db.prepare("SELECT * FROM reviews WHERE user_id = ? AND product_id = ?").get(userId, input.productId);
        if (existing) {
            throw new Error("You have already reviewed this product");
        }
        const row = this.db.prepare(`
      INSERT INTO reviews (user_id, product_id, rating, comment)
      VALUES (@userId, @productId, @rating, @comment)
      RETURNING *
    `).get({
            userId,
            productId: input.productId,
            rating: input.rating,
            comment: input.comment
        });
        const review = (0, review_model_1.rowToReview)(row);
        review.user = this.userService.getById(userId) || undefined;
        return review;
    }
    getByProductId(productId) {
        const rows = this.db.prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC").all(productId);
        return rows.map(row => {
            const review = (0, review_model_1.rowToReview)(row);
            const user = this.userService.getById(review.userId);
            if (user) {
                // Strip sensitive info
                review.user = { id: user.id, name: user.name, email: "", role: "user", createdAt: "" };
            }
            return review;
        });
    }
    getAverageRating(productId) {
        const row = this.db.prepare("SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE product_id = ?").get(productId);
        return {
            average: row.avg ? Number(row.avg.toFixed(1)) : 0,
            count: row.cnt
        };
    }
}
exports.ReviewService = ReviewService;
//# sourceMappingURL=review.service.js.map