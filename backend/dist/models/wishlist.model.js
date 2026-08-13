"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddToWishlistSchema = void 0;
exports.rowToWishlistItem = rowToWishlistItem;
const zod_1 = require("zod");
exports.AddToWishlistSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive()
});
function rowToWishlistItem(row) {
    return {
        id: row.id,
        userId: row.user_id,
        productId: row.product_id,
        createdAt: row.created_at
    };
}
//# sourceMappingURL=wishlist.model.js.map