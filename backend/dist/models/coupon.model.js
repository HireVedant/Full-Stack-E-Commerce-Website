"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateCouponSchema = void 0;
exports.rowToCoupon = rowToCoupon;
const zod_1 = require("zod");
exports.ValidateCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(20)
});
function rowToCoupon(row) {
    return {
        id: row.id,
        code: row.code,
        discountPercentage: row.discount_percentage,
        isActive: row.is_active === 1,
        createdAt: row.created_at
    };
}
//# sourceMappingURL=coupon.model.js.map