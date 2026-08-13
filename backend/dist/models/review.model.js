"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewSchema = void 0;
exports.rowToReview = rowToReview;
const zod_1 = require("zod");
exports.CreateReviewSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().min(2).max(1000)
});
function rowToReview(row) {
    return {
        id: row.id,
        userId: row.user_id,
        productId: row.product_id,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at
    };
}
//# sourceMappingURL=review.model.js.map